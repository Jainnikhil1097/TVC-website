// Tests for the enquiry intake/download endpoints (cms/endpoints/submissions.ts)
// against the local SQLite database. Cleans up everything it creates.
//   node --import tsx scripts/test-submissions.ts
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { getPayload, type PayloadRequest } from "payload";

nextEnv.loadEnvConfig(process.cwd());
delete process.env.BLOB_READ_WRITE_TOKEN; // exercise local storage
delete process.env.SUBMISSIONS_NOTIFY_EMAIL;

const { default: config } = await import("../payload.config");
const { handleIntake, readAttachment, submissionEndpoints } = await import("../cms/endpoints/submissions");
const payload = await getPayload({ config });

const MARK = `test-${Date.now()}@example.com`;
const form = (fields: Record<string, string | File>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
const count = async () =>
  (await payload.count({ collection: "submissions", where: { email: { equals: MARK } }, overrideAccess: true })).totalDocs;
const fileOf = (mb: number, name: string) => new File([new Uint8Array(Math.round(mb * 1024 * 1024))], name, { type: "application/pdf" });

try {
  // 1. Valid investor enquiry is saved.
  let r = await handleIntake(payload, form({ formKind: "investor", name: "Test Investor", phone: "+91 98765 43210", email: MARK }), "10.0.0.1");
  assert.deepEqual(r, { status: 200, body: { ok: true } });
  assert.equal(await count(), 1, "investor enquiry saved");

  // 2. Honeypot filled → reported OK, nothing saved.
  r = await handleIntake(payload, form({ formKind: "investor", name: "Bot", phone: "+91 98765 43210", email: MARK, website: "http://spam" }), "10.0.0.2");
  assert.deepEqual(r, { status: 200, body: { ok: true } });
  assert.equal(await count(), 1, "honeypot submission not saved");

  // 3. Invalid fields rejected with the shared schema's message.
  r = await handleIntake(payload, form({ formKind: "investor", name: "T", phone: "123", email: MARK }), "10.0.0.3");
  assert.equal(r.status, 400);
  assert.equal(r.body.ok, false);

  const startup = {
    formKind: "startup",
    name: "Test Founder",
    phone: "+91 98765 43210",
    email: MARK,
    description: "We are building grid-scale storage for Indian industry.",
    sector: "Energy storage",
    amount: "₹8 Cr",
  };

  // 4. Oversized deck (11 MB) rejected, nothing saved.
  r = await handleIntake(payload, form({ ...startup, deck: fileOf(11, "deck.pdf") }), "10.0.0.4");
  assert.equal(r.status, 413);
  assert.match((r.body as { error: string }).error, /10 MB/);
  assert.equal(await count(), 1);

  // 5. Wrong file type rejected; missing deck rejected.
  r = await handleIntake(payload, form({ ...startup, deck: fileOf(0.1, "deck.exe") }), "10.0.0.5");
  assert.equal(r.status, 400);
  r = await handleIntake(payload, form(startup), "10.0.0.6");
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /pitch deck/);

  // 6. Valid 9 MB deck saved privately (local disk, outside /public) and downloadable.
  r = await handleIntake(payload, form({ ...startup, deck: fileOf(9, "Our Deck (v2).pdf") }), "10.0.0.7");
  assert.deepEqual(r, { status: 200, body: { ok: true } });
  const { docs } = await payload.find({
    collection: "submissions",
    where: { and: [{ email: { equals: MARK } }, { type: { equals: "startup" } }] },
    overrideAccess: true,
  });
  assert.equal(docs.length, 1);
  const saved = docs[0];
  assert.equal(saved.fileName, "Our Deck (v2).pdf");
  assert.equal(saved.company, startup.description);
  assert.match(saved.filePath ?? "", /^local:submissions\/[0-9a-f-]+-Our-Deck-v2-.pdf$/);
  const attachment = await readAttachment(saved.filePath!);
  assert.ok(attachment && (attachment.body as Uint8Array).byteLength === 9 * 1024 * 1024, "attachment readable");
  assert.equal(await readAttachment("local:../../package.json"), null, "path traversal blocked");

  // 7. Download endpoint: 403 for anonymous and editors.
  const download = submissionEndpoints.find((e) => e.path === "/:id/file")!;
  const call = (user: unknown) =>
    download.handler({ payload, user, routeParams: { id: saved.id } } as unknown as PayloadRequest);
  assert.equal((await call(null)).status, 403);
  assert.equal((await call({ role: "editor" })).status, 403);
  const ok = await call({ role: "admin" });
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("content-disposition") ?? "", /attachment; filename=/);

  // 8. Rate limit: 6th submission from one IP within the window is refused.
  const statuses: number[] = [];
  for (let i = 0; i < 6; i++) {
    const res = await handleIntake(payload, form({ formKind: "investor", name: "Test Investor", phone: "+91 98765 43210", email: MARK }), "10.9.9.9");
    statuses.push(res.status);
  }
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);

  console.log("submissions: all assertions passed");
} finally {
  const { docs } = await payload.find({ collection: "submissions", where: { email: { equals: MARK } }, overrideAccess: true, limit: 100 });
  for (const d of docs) {
    if (d.filePath?.startsWith("local:")) await rm(path.join(process.cwd(), ".data", d.filePath.slice(6)), { force: true });
  }
  await payload.delete({ collection: "submissions", where: { email: { equals: MARK } }, overrideAccess: true });
  process.exit(process.exitCode ?? 0);
}
