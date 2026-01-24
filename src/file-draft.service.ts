import * as tools from "@bgord/tools";
import type { MailerTemplateAttachmentType } from "./mailer-template.vo";

export abstract class FileDraft {
  readonly filename: tools.Filename;

  constructor(
    basename: tools.BasenameType,
    extension: tools.ExtensionType,
    readonly mime: tools.Mime,
  ) {
    this.filename = tools.Filename.fromPartsSafe(basename, extension);
  }

  getHeaders(): Headers {
    return new Headers({
      "Content-Type": this.mime.toString(),
      "Content-Disposition": `attachment; filename="${this.filename.get()}"`,
    });
  }

  abstract create(): Promise<BodyInit>;

  async toResponse(): Promise<Response> {
    const body = await this.create();

    return new Response(body, { headers: this.getHeaders() });
  }

  async toAttachment(): Promise<MailerTemplateAttachmentType> {
    const body = await this.create();

    return {
      filename: this.filename.get(),
      content: body as MailerTemplateAttachmentType["content"],
      contentType: this.mime.toString(),
    };
  }
}
