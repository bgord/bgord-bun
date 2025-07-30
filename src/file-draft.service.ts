import type { ReadableStream } from "node:stream/web";
import type * as tools from "@bgord/tools";

export type DraftBody = BodyInit | NodeJS.ReadableStream | ReadableStream;

export abstract class FileDraft {
  constructor(readonly config: { filename: string; mime: tools.Mime }) {}

  getHeaders(): Headers {
    return new Headers({
      "Content-Type": this.config.mime.raw,
      "Content-Disposition": `attachment; filename="${this.config.filename}"`,
    });
  }

  abstract create(): DraftBody | Promise<DraftBody>;

  async toResponse(): Promise<Response> {
    const body = await this.create();

    return new Response(body as BodyInit, { headers: this.getHeaders() });
  }

  async toAttachment() {
    const body = await this.create();

    return { filename: this.config.filename, content: body, contentType: this.config.mime.raw };
  }
}
