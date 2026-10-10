// Tests for direct browser→Blob upload authorisation (cms/endpoints/submissions.ts).
//   node --import tsx scripts/test-uploads.ts
import assert from "node:assert/strict";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
delete process.env.BLOB_READ_WRITE_TOKEN; // exercise the "not configured" paths safely

const { authoriseUpload, verifyDirectUpload } = await import("../cms/endpoints/submissions");
const payload = (o: Record<string, string>) => JSON.stringify(o);

// Allowed: a startup deck as PDF → token limited to 10 MB, private-type list, random suffix.
const ok = await authoriseUpload("submissions/Our-Deck.pdf", payload({ kind: "startup" }));
assert.equal(ok.maximumSizeInBytes, 10 * 1024 * 1024);
assert.equal(ok.addRandomSuffix, true);
assert.ok(ok.allowedContentTypes.includes("application/pdf"));
assert.ok(ok.validUntil > Date.now());

// CVs accept .docx; decks don't.
await authoriseUpload("submissions/cv.docx", payload({ kind: "careers" }));
await assert.rejects(authoriseUpload("submissions/deck.docx", payload({ kind: "startup" })), /Accepted formats/);

// Rejections: wrong type, forms without attachments, spam trap filled, path tampering, junk payload.
await assert.rejects(authoriseUpload("submissions/run.exe", payload({ kind: "startup" })), /Accepted formats/);
await assert.rejects(authoriseUpload("submissions/a.pdf", payload({ kind: "investor" })), /not allowed/);
await assert.rejects(authoriseUpload("submissions/a.pdf", payload({ kind: "startup", website: "http://spam" })), /not allowed/);
await assert.rejects(authoriseUpload("media/a.pdf", payload({ kind: "startup" })), /Invalid upload path/);
await assert.rejects(authoriseUpload("submissions/../media/a.pdf", payload({ kind: "startup" })), /Invalid upload path/);
await assert.rejects(authoriseUpload("submissions/a.pdf", "not json"), /not allowed/);

// Intake can't be pointed at an arbitrary stored file.
assert.equal(await verifyDirectUpload(undefined, undefined), null);
const forged = await verifyDirectUpload("media/someone-else.pdf", "x.pdf");
assert.ok(forged && "error" in forged);
const unconfigured = await verifyDirectUpload("submissions/a.pdf", "a.pdf");
assert.ok(unconfigured && "error" in unconfigured, "without Blob storage, references are refused");

console.log("uploads: all assertions passed");
process.exit(0);
