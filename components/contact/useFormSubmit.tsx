"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { formsEmail, submitForm, successMessage, type FormKind } from "@/lib/forms";
import { Button } from "@/components/ui/Button";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success"; viaEmail?: boolean }
  | { state: "error"; message: string };

/** Converts validated values to FormData (files included) and sends them via submitForm. */
export function useFormSubmit(kind: FormKind) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function send(values: Record<string, unknown>) {
    setStatus({ state: "sending" });
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value == null || value === "") continue;
      if (typeof FileList !== "undefined" && value instanceof FileList) {
        if (value[0]) data.append(key, value[0]);
      } else {
        data.append(key, String(value));
      }
    }
    const result = await submitForm(kind, data);
    setStatus(result.ok ? { state: "success", viaEmail: result.viaEmail } : { state: "error", message: result.error });
    return result.ok;
  }

  return { status, send, reset: () => setStatus({ state: "idle" }) };
}

export function FormSuccess({ onReset, viaEmail, attachment }: { onReset: () => void; viaEmail?: boolean; attachment?: string }) {
  return (
    <div role="status" className="rounded-2xl border border-teal-ink/25 bg-teal-ink/[0.05] p-6 sm:p-8">
      {viaEmail ? <Mail className="size-7 text-teal-ink" aria-hidden /> : <CheckCircle2 className="size-7 text-teal-ink" aria-hidden />}
      {viaEmail ? (
        <div className="mt-4 space-y-2 text-ink">
          <p className="text-lg">Your email app has opened with your details. Press Send to reach us{attachment ? `, and attach your ${attachment}` : ""}.</p>
          <p className="text-sm text-muted">
            Nothing opened? Email us at{" "}
            <a href={`mailto:${formsEmail}`} className="underline underline-offset-4 hover:text-teal-ink">
              {formsEmail}
            </a>
            .
          </p>
        </div>
      ) : (
        <p className="mt-4 text-lg text-ink">{successMessage}</p>
      )}
      <Button variant="secondary" className="mt-6" onClick={onReset}>
        Send another
      </Button>
    </div>
  );
}

export function SubmitRow({ status, label = "Submit" }: { status: Status; label?: string }) {
  const sending = status.state === "sending";
  return (
    <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <div aria-live="polite" className="text-sm">
        {status.state === "error" && (
          <p role="alert" className="text-red-700">
            {status.message}
          </p>
        )}
      </div>
      <Button type="submit" variant="primary" disabled={sending} aria-disabled={sending} className="w-full sm:w-auto sm:min-w-40">
        {sending ? "Sending…" : label}
      </Button>
    </div>
  );
}
