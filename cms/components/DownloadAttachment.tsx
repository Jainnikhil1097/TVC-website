"use client";

import { useDocumentInfo, useFormFields } from "@payloadcms/ui";

/** Admin-only download link for an enquiry's attachment (pitch deck / CV). */
export function DownloadAttachment() {
  const { id } = useDocumentInfo();
  const fileName = useFormFields(([fields]) => fields.fileName?.value as string | undefined);

  if (!id || !fileName) {
    return <p style={{ color: "var(--theme-elevation-500)", margin: "0 0 1rem" }}>No attachment.</p>;
  }

  return (
    <p style={{ margin: "0 0 1.5rem" }}>
      <a
        href={`/api/submissions/${id}/file`}
        className="btn btn--style-secondary btn--size-small"
        style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}
      >
        Download {fileName}
      </a>
    </p>
  );
}
