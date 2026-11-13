import { honeypotField } from "@/lib/forms";

/** id + aria wiring for a control inside <Field name={id}>. */
export function a11y(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}

export const fileInputClass =
  "py-2.5 file:mr-4 file:min-h-9 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface file:px-4 file:text-sm file:font-medium file:text-ink hover:file:bg-line";

/**
 * Anti-spam trap: invisible to people and screen readers, but naive bots fill it
 * in. Submissions with a value here are accepted silently and discarded.
 */
export function Honeypot({ register }: { register: (name: typeof honeypotField) => object }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...register(honeypotField)} />
      </label>
    </div>
  );
}
