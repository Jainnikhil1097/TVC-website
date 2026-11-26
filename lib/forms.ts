// Form constants and the single submission adapter used by every website form.
// Safe to import from client components (no server-only code here).
import { isLiveStatic, isStaticPreview } from "./base-path";

export type FormKind = "startup" | "investor" | "partner";

/** viaEmail: the live static site handed the form to the visitor's email app instead. */
export type SubmitResult = { ok: true; viaEmail?: boolean } | { ok: false; error: string };

export const contactIntro =
  "We'd love to hear from you. Choose the option that fits and we'll route it to the right person.";

export const enquiryTypes = [
  { id: "startup", label: "Startups & Founders", blurb: "Building in energy? Share your deck — we read every one." },
  { id: "investor", label: "Investors", blurb: "Interested in our funds? Our investor relations team will reach out." },
  { id: "partner", label: "Ecosystem Partners", blurb: "Corporates, research labs, governments and fellow investors." },
] as const;

export type EnquiryType = (typeof enquiryTypes)[number]["id"];

/** Matches the home page's "Where we invest" sectors, plus "Other" for anything new. */
export const startupSectors = [
  "Mobility",
  "Industrial",
  "Built environment",
  "Semiconductors",
  "Power electronics",
  "Renewable tech",
  "Energy storage",
  "Alternative fuels",
  "Other",
];

export const maxUploadMb = 10;

/** Which forms take an attachment, under which field name, and in which formats. */
export const fileRules: Record<FormKind, { field: string; label: string; accept: string[] } | null> = {
  startup: { field: "deck", label: "pitch deck", accept: [".pdf", ".ppt", ".pptx"] },
  investor: null,
  partner: null,
};

/** Media types per allowed extension, used for direct-to-storage uploads. */
export const mimeTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export const extensionOf = (name: string) => "." + (name.split(".").pop() ?? "").toLowerCase();

/** Name of the hidden anti-spam field. Real visitors never fill it in. */
export const honeypotField = "website";

export const successMessage = "Thank you — your submission has been received. We'll be in touch.";

const GENERIC_ERROR = "Something went wrong. Please try again, or email us directly.";
const PREVIEW_ERROR =
  "This is a preview of the new website, so forms are switched off. Please email us directly instead.";

/**
 * Uploads an attachment straight from the browser to private Blob storage, so
 * large decks aren't limited by the host's request-size cap (4.5 MB on Vercel).
 * Returns the stored pathname, or null when direct uploads aren't available
 * (e.g. local development) — the file is then sent with the form instead.
 */
async function directUpload(kind: FormKind, file: File, honeypot: string): Promise<string | null> {
  try {
    const { upload } = await import("@vercel/blob/client");
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "file";
    const blob = await upload(`submissions/${safe}`, file, {
      access: "private",
      handleUploadUrl: "/api/submissions/upload-token",
      clientPayload: JSON.stringify({ kind, [honeypotField]: honeypot }),
      contentType: mimeTypes[extensionOf(file.name)],
      multipart: file.size > 5 * 1024 * 1024,
    });
    return blob.pathname;
  } catch {
    return null;
  }
}

/** Where the live static site's forms are addressed (the public enquiries inbox). */
export const formsEmail = process.env.NEXT_PUBLIC_FORMS_EMAIL || "info@transitionventurecapital.com";

/** "companyName" → "Company name". */
const fieldLabel = (key: string) => {
  const words = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The live static site has no server to receive forms (until NEXT_PUBLIC_FORMS_ENDPOINT
 * points at one), so it opens the visitor's email app with the details filled in,
 * addressed to the enquiries inbox. An attachment can't be added this way; the message
 * asks for it.
 */
function handToEmail(kind: FormKind, data: FormData): SubmitResult {
  const type = enquiryTypes.find((t) => t.id === kind)?.label ?? "Enquiry";
  const lines: string[] = [];
  let attachment = "";
  for (const [key, value] of data.entries()) {
    if (key === honeypotField || key === "formKind") continue;
    if (typeof value !== "string") {
      if (value.size > 0) attachment = value.name;
      continue;
    }
    lines.push(`${fieldLabel(key)}: ${value}`);
  }
  const rule = fileRules[kind];
  if (rule) lines.push("", attachment ? `Please find my ${rule.label} (${attachment}) attached.` : `I'll attach my ${rule.label}.`);
  const name = String(data.get("companyName") || data.get("organisation") || data.get("fullName") || data.get("name") || "").trim();
  const subject = `Website enquiry: ${type}${name ? ` — ${name}` : ""}`;
  const href = `mailto:${formsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n").slice(0, 1800))}`;
  window.location.href = href;
  return { ok: true, viaEmail: true };
}

/**
 * Sends a form to the CMS intake endpoint (`/api/submissions/intake`), which
 * validates it again, checks any attachment and saves it to the Enquiries
 * inbox. NEXT_PUBLIC_FORMS_ENDPOINT can point elsewhere if needed.
 */
export async function submitForm(kind: FormKind, data: FormData): Promise<SubmitResult> {
  // A static build has no server to receive forms, unless an endpoint is configured.
  if (isStaticPreview && !process.env.NEXT_PUBLIC_FORMS_ENDPOINT) {
    return isLiveStatic ? handToEmail(kind, data) : { ok: false, error: PREVIEW_ERROR };
  }
  const endpoint = process.env.NEXT_PUBLIC_FORMS_ENDPOINT || "/api/submissions/intake";
  data.set("formKind", kind);

  const rule = fileRules[kind];
  const file = rule ? data.get(rule.field) : null;
  if (rule && file instanceof File && file.size > 0) {
    const pathname = await directUpload(kind, file, String(data.get(honeypotField) ?? ""));
    if (pathname) {
      data.delete(rule.field);
      data.set("fileRef", pathname);
      data.set("fileName", file.name);
    }
  }

  try {
    const res = await fetch(endpoint, { method: "POST", body: data });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res.ok && body?.ok !== false) return { ok: true };
    if (res.status === 429) return { ok: false, error: "Too many submissions. Please try again in a few minutes." };
    if (res.status === 413) return { ok: false, error: `Your file is too large. The limit is ${maxUploadMb} MB.` };
    return { ok: false, error: body?.error || GENERIC_ERROR };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}
