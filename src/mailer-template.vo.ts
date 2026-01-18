import type * as tools from "@bgord/tools";

type MailerTemplateConfig = { from: tools.EmailType; to: tools.EmailType };

type MailerTemplateAttachmentType = {
  content?: string | Buffer;
  filename?: string | false | undefined;
  path?: string;
  contentType?: string;
  contentId?: string;
};

export class MailerTemplate {
  constructor(
    readonly config: MailerTemplateConfig,
    readonly template: tools.NotificationTemplate,
    readonly attachments?: MailerTemplateAttachmentType[],
  ) {}

  toJSON() {
    return { config: this.config, template: this.template.get() };
  }
}
