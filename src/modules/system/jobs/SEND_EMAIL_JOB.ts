import * as tools from "@bgord/tools";
import * as v from "valibot";
import { JobEnvelopeSchema } from "../../../job-envelope";
import { MailerContentHtml } from "../../../mailer-content-html.vo";
import { MailerSubject } from "../../../mailer-subject.vo";

// Stryker disable all
export const SEND_EMAIL_JOB = "SEND_EMAIL_JOB";
// Stryker restore all

export const SendEmailJobSchema = v.object({
  ...JobEnvelopeSchema,
  name: v.literal(SEND_EMAIL_JOB),
  payload: v.object({
    from: tools.Email,
    to: tools.Email,
    subject: MailerSubject,
    html: MailerContentHtml,
  }),
});

export type SendEmailJobType = v.InferOutput<typeof SendEmailJobSchema>;
