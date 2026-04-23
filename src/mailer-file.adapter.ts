import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { TemporaryFilePort } from "./temporary-file.port";

type Dependencies = { TemporaryFile: TemporaryFilePort; Clock: ClockPort };

export class MailerFileAdapter implements MailerPort {
  constructor(private readonly deps: Dependencies) {}

  async send(template: MailerTemplate): Promise<void> {
    const timestamp = this.deps.Clock.now();
    const filename = tools.Filename.fromString(`${timestamp.ms}.html`);

    const content = [
      `From       : ${template.config.from}`,
      `To         : ${template.config.to}`,
      `Subject    : ${template.message.subject}`,
      `Date       : ${timestamp.toInstant().toZonedDateTimeISO("UTC").toPlainDateTime()}`,
      `Attachments: ${template.attachments?.length ?? 0}`,
      "-".repeat(50),
      template.message.html,
    ].join("\n");

    const file = new File([content], filename.get());

    await this.deps.TemporaryFile.write(filename, file);
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
