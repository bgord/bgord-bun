import type * as tools from "@bgord/tools";
import type { MailerContentHtmlType } from "./mailer-content-html.vo";
import type { MailerSubjectType } from "./mailer-subject.vo";

export type MailerTemplateConfig = { from: tools.EmailType; to: tools.EmailType };

export type MailerTemplateMessage = { subject: MailerSubjectType; html: MailerContentHtmlType };

export type MailerTemplateAttachmentType = {
  content?: string | Buffer;
  filename?: string | false | undefined;
  path?: string;
  contentType?: string;
  contentId?: string;
};

export class MailerTemplate {
  constructor(
    readonly config: MailerTemplateConfig,
    readonly message: MailerTemplateMessage,
    readonly attachments?: MailerTemplateAttachmentType[],
  ) {}

  toJSON() {
    return { config: this.config, message: this.message };
  }
}
