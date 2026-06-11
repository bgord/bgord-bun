import type { MailerPort } from "../../../mailer.port";
import { MailerTemplate } from "../../../mailer-template.vo";
import type { SendEmailJobType } from "../jobs";

type Dependencies = { Mailer: MailerPort };

export const SendEmailJobHandler =
  (deps: Dependencies) =>
  async (job: SendEmailJobType): Promise<void> => {
    const template = new MailerTemplate(
      { from: job.payload.from, to: job.payload.to },
      { subject: job.payload.subject, html: job.payload.html },
    );

    await deps.Mailer.send(template);
  };
