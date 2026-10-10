"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/mini";
import { fileRules, maxUploadMb, startupSectors } from "@/lib/forms";
import { fileField, honeypot, textFields } from "@/lib/schemas";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { a11y, fileInputClass, Honeypot } from "./formUi";
import { FormSuccess, SubmitRow, useFormSubmit } from "./useFormSubmit";

const deckAccept = fileRules.startup!.accept;

const schema = z.object({ ...textFields.startup, ...honeypot, deck: fileField("startup") });

const p = "startup";

export function StartupForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const { status, send, reset: resetStatus } = useFormSubmit("startup");

  if (status.state === "success") return <FormSuccess onReset={resetStatus} />;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        if (await send(values)) reset();
      })}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name={`${p}-name`} error={errors.name?.message}>
          <Input autoComplete="name" {...a11y(`${p}-name`, errors.name?.message)} {...register("name")} />
        </Field>
        <Field label="Phone number" name={`${p}-phone`} error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...a11y(`${p}-phone`, errors.phone?.message)} {...register("phone")} />
        </Field>
        <Field label="Email address" name={`${p}-email`} error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...a11y(`${p}-email`, errors.email?.message)} {...register("email")} />
        </Field>
        <Field label="Sector" name={`${p}-sector`} error={errors.sector?.message}>
          <Select defaultValue="" {...a11y(`${p}-sector`, errors.sector?.message)} {...register("sector")}>
            <option value="" disabled>
              Select a sector
            </option>
            {startupSectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="What are you building?" name={`${p}-description`} error={errors.description?.message}>
        <Textarea
          rows={4}
          placeholder="The problem, your technology, and where you are today."
          {...a11y(`${p}-description`, errors.description?.message)}
          {...register("description")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Amount raising" name={`${p}-amount`} error={errors.amount?.message}>
          <Input placeholder="e.g. ₹8 Cr or $1M" {...a11y(`${p}-amount`, errors.amount?.message)} {...register("amount")} />
        </Field>
        <Field label="Valuation" name={`${p}-valuation`} optional error={errors.valuation?.message}>
          <Input {...a11y(`${p}-valuation`, errors.valuation?.message)} {...register("valuation")} />
        </Field>
      </div>

      <Field
        label="Pitch deck"
        name={`${p}-deck`}
        error={errors.deck?.message}
        hint={`PDF, PPT or PPTX · up to ${maxUploadMb} MB`}
      >
        <Input
          type="file"
          accept={deckAccept.join(",")}
          className={cn(fileInputClass)}
          {...a11y(`${p}-deck`, errors.deck?.message)}
          {...register("deck")}
        />
      </Field>

      <Honeypot register={register} />
      <SubmitRow status={status} label="Submit pitch" />
    </form>
  );
}
