// Tests for roles and access rules (cms/access.ts, Users hook) against the local DB.
//   node --import tsx scripts/test-roles.ts
// Runs only when there are no users yet (so it can check the first-user rule), and
// deletes everything it creates.
import assert from "node:assert/strict";
import nextEnv from "@next/env";
import { getPayload } from "payload";

nextEnv.loadEnvConfig(process.cwd());
const { default: config } = await import("../payload.config");
const payload = await getPayload({ config });
const context = { disableRevalidate: true };

const existing = await payload.count({ collection: "users" });
if (existing.totalDocs > 0) {
  console.log(`roles: skipped (database already has ${existing.totalDocs} users)`);
  process.exit(0);
}

const created: number[] = [];
try {
  // First account becomes Admin even if "editor" is requested.
  const first = await payload.create({
    collection: "users",
    context,
    data: { email: "first@test.local", password: "correct-horse-battery", name: "First", role: "editor" },
  });
  created.push(first.id);
  assert.equal(first.role, "admin", "first user is promoted to admin");

  const editor = await payload.create({
    collection: "users",
    context,
    data: { email: "editor@test.local", password: "correct-horse-battery", name: "Editor", role: "editor" },
  });
  created.push(editor.id);
  assert.equal(editor.role, "editor", "later users keep their role");

  const as = (user: typeof editor) => ({ overrideAccess: false, user, context });

  // Editors can edit content…
  const company = await payload.find({ collection: "companies", limit: 1 });
  const target = company.docs[0];
  await payload.update({ collection: "companies", id: target.id, data: { order: target.order ?? 100 }, ...as(editor) });

  // …but not regulated figures, funds, enquiries or users.
  await assert.rejects(
    payload.updateGlobal({ slug: "fund-metrics", data: { disclaimer: "x" }, ...as(editor) }),
    /not allowed|Forbidden/i
  );
  const fund = (await payload.find({ collection: "funds", limit: 1 })).docs[0];
  await assert.rejects(
    payload.update({ collection: "funds", id: fund.id, data: { size: "₹1 Cr" }, ...as(editor) }),
    /not allowed|Forbidden/i
  );
  await assert.rejects(payload.find({ collection: "submissions", ...as(editor) }), /not allowed|Forbidden/i);
  await assert.rejects(
    payload.create({
      collection: "users",
      data: { email: "x@test.local", password: "correct-horse-battery", name: "X", role: "admin" },
      ...as(editor),
    }),
    /not allowed|Forbidden/i
  );
  // An editor can't promote themselves.
  const self = await payload.update({ collection: "users", id: editor.id, data: { role: "admin" }, ...as(editor) });
  assert.equal(self.role, "editor", "role changes by editors are ignored");

  // Admins can do all of the above.
  await payload.updateGlobal({ slug: "fund-metrics", data: {}, ...as(first) });
  await payload.find({ collection: "submissions", ...as(first) });

  // The public (no user) can't write anything and only sees published content.
  await assert.rejects(
    payload.update({ collection: "companies", id: target.id, data: { name: "Hacked" }, overrideAccess: false, context }),
    /not allowed|Forbidden/i
  );
  await assert.rejects(payload.find({ collection: "submissions", overrideAccess: false }), /not allowed|Forbidden/i);

  console.log("roles: all assertions passed");
} finally {
  for (const id of created) await payload.delete({ collection: "users", id, context });
}
process.exit(0);
