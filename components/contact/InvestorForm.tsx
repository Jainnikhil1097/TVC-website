"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input } from "@/components/ui/Field";
import { clientSchemas } from "@/lib/schemas";
import { a11y, Honeypot } from "./formUi";
import { FormSuccess, SubmitRow, useFormSubmit } from "./useFormSubmit";

const schema = clientSchemas.investor;

const p = "investor";

export function InvestorForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const { status, send, reset: resetStatus } = useFormSubmit("investor");

  if (status.state === "success") return <FormSuccess onReset={resetStatus} />;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        if (await send(values)) reset();
      })}
      className="space-y-5"
    >
      <Field label="Full name" name={`${p}-name`} error={errors.name?.message}>
        <Input autoComplete="name" {...a11y(`${p}-name`, errors.name?.message)} {...register("name")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone number" name={`${p}-phone`} error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...a11y(`${p}-phone`, errors.phone?.message)} {...register("phone")} />
        </Field>
        <Field label="Email address" name={`${p}-email`} error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...a11y(`${p}-email`, errors.email?.message)} {...register("email")} />
        </Field>
      </div>
      <Honeypot register={register} />
      <SubmitRow status={status} label="Request a call" />
    </form>
  );
}
