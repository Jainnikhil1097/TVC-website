"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/mini";
import { fileRules, maxUploadMb } from "@/lib/forms";
import { fileField, honeypot, textFields } from "@/lib/schemas";
import { Field, Input } from "@/components/ui/Field";
import { a11y, fileInputClass, Honeypot } from "@/components/contact/formUi";
import { FormSuccess, SubmitRow, useFormSubmit } from "@/components/contact/useFormSubmit";

const cvAccept = fileRules.careers!.accept;

const schema = z.object({ ...textFields.careers, ...honeypot, cv: fileField("careers") });

const p = "cv";

export function CvForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const { status, send, reset: resetStatus } = useFormSubmit("careers");

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
      <Field label="CV" name={`${p}-cv`} error={errors.cv?.message} hint={`PDF, DOC or DOCX · up to ${maxUploadMb} MB`}>
        <Input
          type="file"
          accept={cvAccept.join(",")}
          className={fileInputClass}
          {...a11y(`${p}-cv`, errors.cv?.message)}
          {...register("cv")}
        />
      </Field>
      <Honeypot register={register} />
      <SubmitRow status={status} label="Share your CV" />
    </form>
  );
}
