import * as bg from "@bgord/bun";
import type { SendEmailJobType } from "../jobs";

type Dependencies = { Mailer: bg.MailerPort };

export const SendEmailJobHandler =
  (deps: Dependencies) =>
  async (job: SendEmailJobType): Promise<void> => {
    const template = new bg.MailerTemplate(
      { from: job.payload.from, to: job.payload.to },
      { subject: job.payload.subject, html: job.payload.html },
    );

    await deps.Mailer.send(template);
  };
