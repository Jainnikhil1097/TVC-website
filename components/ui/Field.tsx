"use client";

import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "block w-full rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors focus:border-teal-ink focus:outline-none aria-[invalid=true]:border-red-600/70";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control + error wrapper. Pass the control as children with id={name}. */
export function Field({ label, name, error, hint, optional, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 flex items-baseline justify-between text-sm font-medium text-ink">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(function Input(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(control, "min-h-12", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(function Textarea(
  { className, rows = 4, ...props },
  ref
) {
  return <textarea ref={ref} rows={rows} className={cn(control, "resize-y", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select">>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        control,
        "min-h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235a6576%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[position:right_1rem_center] bg-no-repeat pr-10",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
