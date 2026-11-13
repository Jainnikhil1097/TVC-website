// Shared validation for every website form. Used by the client forms (with
// react-hook-form) and by the CMS intake endpoint (cms/endpoints/submissions.ts),
// so the browser and the server always apply the same rules.
// zod/mini: same validation as full zod at a fraction of the bundle size.
import * as z from "zod/mini";
import { fileRules, honeypotField, maxUploadMb, type FormKind } from "./forms";

export const nameField = z.string().check(z.trim(), z.minLength(2, "Please enter your full name."));

export const phoneField = z
  .string()
  .check(z.trim(), z.regex(/^\+?[\d\s()-]{7,20}$/, "Please enter a valid phone number."));

export const emailField = z.pipe(z.string().check(z.trim()), z.email("Please enter a valid email address."));

const contactFields = { name: nameField, phone: phoneField, email: emailField };

/** Text fields per form (files are validated separately, see validateFile). */
export const textFields = {
  startup: {
    ...contactFields,
    description: z
      .string()
      .check(
        z.trim(),
        z.minLength(20, "Please tell us a little more — at least 20 characters."),
        z.maxLength(2000, "Please keep this under 2,000 characters.")
      ),
    sector: z.string().check(z.minLength(1, "Please choose a sector.")),
    amount: z.string().check(z.trim(), z.minLength(1, "Please enter the amount you're raising.")),
    valuation: z.optional(z.string().check(z.trim(), z.maxLength(200))),
  },
  investor: contactFields,
  partner: {
    ...contactFields,
    message: z
      .string()
      .check(
        z.trim(),
        z.minLength(10, "Please add a short message — at least 10 characters."),
        z.maxLength(2000, "Please keep this under 2,000 characters.")
      ),
  },
} satisfies Record<FormKind, Record<string, z.ZodMiniType>>;

/** The hidden anti-spam field, passed through so the server can check it. */
export const honeypot = { [honeypotField]: z.optional(z.string()) };

/** Client-side schemas (text + honeypot; forms add their file field). */
export const clientSchemas = {
  investor: z.object({ ...textFields.investor, ...honeypot }),
  partner: z.object({ ...textFields.partner, ...honeypot }),
};

/** Server-side schemas for the text part of each form. */
export const intakeSchemas = {
  startup: z.object(textFields.startup),
  investor: z.object(textFields.investor),
  partner: z.object(textFields.partner),
};

type FileLike = { name: string; size: number };

/** Returns an error message, or null when the file is acceptable. */
export function validateFile(kind: FormKind, file: FileLike | null | undefined): string | null {
  const rule = fileRules[kind];
  if (!rule) return file ? "This form doesn't accept attachments." : null;
  if (!file || file.size === 0) return `Please attach your ${rule.label}.`;
  if (file.size > maxUploadMb * 1024 * 1024) return `File must be ${maxUploadMb} MB or smaller.`;
  const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
  if (!rule.accept.includes(ext)) return `Accepted formats: ${rule.accept.join(", ")}.`;
  return null;
}

/** Client-side file field: validates the FileList react-hook-form provides. */
export function fileField(kind: FormKind) {
  return z.custom<FileList | undefined>().check(
    z.superRefine((files, ctx) => {
      const error = validateFile(kind, files?.[0]);
      if (error) ctx.addIssue({ code: "custom", message: error });
    })
  );
}
