import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Endpoint, Payload } from "payload";
import { extensionOf, fileRules, honeypotField, maxUploadMb, mimeTypes, type FormKind } from "@/lib/forms";
import { intakeSchemas, validateFile } from "@/lib/schemas";

// Website form intake → Enquiries (Submissions) collection.
//
//   POST /api/submissions/upload-token  authorises one private browser→Blob upload (large decks)
//   POST /api/submissions/intake        multipart/form-data from lib/forms.ts submitForm()
//   GET  /api/submissions/:id/file      admin-only download of the attached pitch deck
//
// Attachments are never public: with BLOB_READ_WRITE_TOKEN they go to Vercel Blob
// as *private* blobs; without it (local dev) to .data/submissions/ (gitignored).

const KINDS: FormKind[] = ["startup", "investor", "partner"];
const LOCAL_ROOT = path.join(process.cwd(), ".data");

// ─── Rate limiting ───────────────────────────────────────────────────────────
// Best-effort: in-memory, so it's per server instance (each serverless instance
// keeps its own window). Enough to blunt casual flooding; not a security boundary.
const WINDOW_MS = 10 * 60 * 1000;

function createLimiter(maxPerWindow: number) {
  const hits = new Map<string, number[]>();
  return (ip: string, now = Date.now()) => {
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= maxPerWindow) {
      hits.set(ip, recent);
      return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear(); // bound memory
    return false;
  };
}

export const rateLimited = createLimiter(5);
const uploadRateLimited = createLimiter(10);

// ─── File storage ────────────────────────────────────────────────────────────
function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+/, "").slice(-100) || "file";
}

async function storeFile(file: File): Promise<string> {
  const key = `submissions/${randomUUID()}-${safeName(file.name)}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const { put } = await import("@vercel/blob");
    const result = await put(key, file, {
      access: "private",
      token,
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    return `blob:${result.pathname}`;
  }
  const target = path.join(LOCAL_ROOT, key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return `local:${key}`;
}

// ─── Direct uploads (browser → private Blob) ─────────────────────────────────
// Vercel limits request bodies to 4.5 MB, so decks up to maxUploadMb go straight
// from the browser to Blob using a short-lived token that only allows one private
// file of an accepted type and size under submissions/. The intake then checks the
// stored file before saving the enquiry.

type DirectFile = { name: string; size: number; pathname: string };

export async function verifyDirectUpload(
  pathname: string | undefined,
  fileName: string | undefined
): Promise<DirectFile | { error: string } | null> {
  if (!pathname) return null;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !pathname.startsWith("submissions/") || pathname.includes("..")) {
    return { error: "Your file couldn't be verified. Please try attaching it again." };
  }
  try {
    const { head } = await import("@vercel/blob");
    const blob = await head(pathname, { token });
    return { name: fileName || blob.pathname.split("/").pop() || "attachment", size: blob.size, pathname: blob.pathname };
  } catch {
    return { error: "Your file couldn't be found. Please try attaching it again." };
  }
}

export async function authoriseUpload(pathname: string, clientPayload: string | null) {
  let kind: FormKind | undefined;
  let honeypot = "";
  try {
    const parsed = JSON.parse(clientPayload ?? "{}") as Record<string, string>;
    kind = parsed.kind as FormKind;
    honeypot = parsed[honeypotField] ?? "";
  } catch {
    /* handled below */
  }
  const rule = kind ? fileRules[kind] : null;
  if (!rule || honeypot) throw new Error("Upload not allowed.");
  if (!pathname.startsWith("submissions/") || pathname.includes("..")) throw new Error("Invalid upload path.");
  if (!rule.accept.includes(extensionOf(pathname))) throw new Error(`Accepted formats: ${rule.accept.join(", ")}.`);
  return {
    // Some browsers report office files as octet-stream; the extension is checked above.
    allowedContentTypes: [...rule.accept.map((ext) => mimeTypes[ext]).filter(Boolean), "application/octet-stream"],
    maximumSizeInBytes: maxUploadMb * 1024 * 1024,
    addRandomSuffix: true,
    validUntil: Date.now() + 10 * 60 * 1000,
  };
}

// ─── Intake ──────────────────────────────────────────────────────────────────
type IntakeResult = { status: number; body: { ok: true } | { ok: false; error: string } };

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v : undefined;
};

export async function handleIntake(payload: Payload, form: FormData, ip: string): Promise<IntakeResult> {
  // Bots fill in the hidden field: pretend success, save nothing.
  if (text(form, honeypotField)) return { status: 200, body: { ok: true } };

  if (rateLimited(ip)) {
    return { status: 429, body: { ok: false, error: "Too many submissions. Please try again in a few minutes." } };
  }

  const kind = text(form, "formKind") as FormKind | undefined;
  if (!kind || !KINDS.includes(kind)) return { status: 400, body: { ok: false, error: "Unknown form." } };

  const values: Record<string, string> = {};
  for (const key of Object.keys(intakeSchemas[kind].def.shape)) {
    const v = text(form, key);
    if (v !== undefined && v !== "") values[key] = v;
  }
  const parsed = intakeSchemas[kind].safeParse(values);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: 400, body: { ok: false, error: first?.message ?? "Please check the form and try again." } };
  }

  const rule = fileRules[kind];
  const upload = rule ? form.get(rule.field) : null;
  const direct = rule && !(upload instanceof File) ? await verifyDirectUpload(text(form, "fileRef"), text(form, "fileName")) : null;
  if (direct && "error" in direct) return { status: 400, body: { ok: false, error: direct.error } };
  const file = upload instanceof File ? upload : (direct ?? null);
  const fileError = validateFile(kind, file);
  if (fileError) return { status: file && fileError.includes("MB") ? 413 : 400, body: { ok: false, error: fileError } };

  const data = parsed.data as Record<string, string | undefined>;
  const filePath = upload instanceof File ? await storeFile(upload) : direct ? `blob:${direct.pathname}` : undefined;

  const doc = await payload.create({
    collection: "submissions",
    overrideAccess: true,
    data: {
      type: kind,
      status: "new",
      name: data.name!,
      email: data.email!,
      phone: data.phone,
      company: data.description,
      message: data.message,
      sector: data.sector,
      amount: data.amount,
      valuation: data.valuation,
      fileName: file?.name,
      fileSize: file?.size,
      filePath,
    },
  });

  // Optional alert. Never let an email failure lose a submission.
  const notify = process.env.SUBMISSIONS_NOTIFY_EMAIL;
  if (notify) {
    try {
      await payload.sendEmail({
        to: notify,
        subject: `New website enquiry (${kind}): ${data.name}`,
        text: [
          `Type: ${kind}`,
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          data.phone && `Phone: ${data.phone}`,
          file && `Attachment: ${file.name}`,
          "",
          `Review it in the admin: ${process.env.NEXT_PUBLIC_SERVER_URL ?? ""}/admin/collections/submissions/${doc.id}`,
        ]
          .filter((line): line is string => typeof line === "string")
          .join("\n"),
      });
    } catch (error) {
      payload.logger.error({ err: error, msg: "Failed to send enquiry notification email" });
    }
  }

  return { status: 200, body: { ok: true } };
}

// ─── Download ────────────────────────────────────────────────────────────────
export async function readAttachment(filePath: string): Promise<{ body: BodyInit; contentType?: string } | null> {
  if (filePath.startsWith("blob:")) {
    const { get } = await import("@vercel/blob");
    const result = await get(filePath.slice("blob:".length), {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return null;
    return { body: result.stream, contentType: result.blob.contentType };
  }
  if (filePath.startsWith("local:")) {
    const target = path.resolve(LOCAL_ROOT, filePath.slice("local:".length));
    if (!target.startsWith(path.join(LOCAL_ROOT, "submissions") + path.sep)) return null; // no path traversal
    try {
      return { body: new Uint8Array(await readFile(target)) };
    } catch {
      return null;
    }
  }
  return null;
}

function clientIp(headers?: Headers) {
  return headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || headers?.get("x-real-ip") || "unknown";
}

export const submissionEndpoints: Endpoint[] = [
  {
    path: "/upload-token",
    method: "post",
    handler: async (req) => {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      // Without Blob storage (local dev) the browser falls back to sending the file with the form.
      if (!token) return Response.json({ error: "Direct uploads are not enabled." }, { status: 404 });
      if (uploadRateLimited(clientIp(req.headers))) {
        return Response.json({ error: "Too many uploads. Please try again in a few minutes." }, { status: 429 });
      }
      try {
        const { handleUpload } = await import("@vercel/blob/client");
        const body = await req.json!();
        const result = await handleUpload({
          token,
          request: req as unknown as Request,
          body,
          onBeforeGenerateToken: authoriseUpload,
        });
        return Response.json(result);
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "Upload not allowed." }, { status: 400 });
      }
    },
  },
  {
    path: "/intake",
    method: "post",
    handler: async (req) => {
      let form: FormData;
      try {
        form = await req.formData!();
      } catch {
        return Response.json({ ok: false, error: "Invalid form data." }, { status: 400 });
      }
      try {
        const { status, body } = await handleIntake(req.payload, form, clientIp(req.headers));
        return Response.json(body, { status });
      } catch (error) {
        req.payload.logger.error({ err: error, msg: "Enquiry intake failed" });
        return Response.json(
          { ok: false, error: "Something went wrong. Please try again, or email us directly." },
          { status: 500 }
        );
      }
    },
  },
  {
    path: "/:id/file",
    method: "get",
    handler: async (req) => {
      if ((req.user as { role?: string } | null)?.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      const id = String(req.routeParams?.id ?? "");
      const doc = await req.payload
        .findByID({ collection: "submissions", id, overrideAccess: true, depth: 0 })
        .catch(() => null);
      if (!doc?.filePath) return Response.json({ error: "Not found" }, { status: 404 });

      const file = await readAttachment(doc.filePath);
      if (!file) return Response.json({ error: "File not found" }, { status: 404 });

      const name = doc.fileName || "attachment";
      return new Response(file.body, {
        headers: {
          "Content-Type": file.contentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${safeName(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    },
  },
];
