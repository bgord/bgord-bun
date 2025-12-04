import type { ReadableStream } from "node:stream/web";
import * as tools from "@bgord/tools";

export type DraftBody = BodyInit | NodeJS.ReadableStream | ReadableStream;

export abstract class FileDraft {
  readonly filename: tools.Filename;

  constructor(basename: tools.BasenameType, mime: tools.Mime) {
    this.filename = tools.Filename.fromPartsSafe(basename, mime.toExtension());
  }

  getHeaders(): Headers {
    return new Headers({
      "Content-Type": this.filename.getMime().toString(),
      "Content-Disposition": `attachment; filename="${this.filename.get()}"`,
    });
  }

  abstract create(): DraftBody | Promise<DraftBody>;

  async toResponse(): Promise<Response> {
    const body = await this.create();

    return new Response(body as BodyInit, { headers: this.getHeaders() });
  }

  async toAttachment() {
    const body = await this.create();

    return { filename: this.filename, content: body, contentType: this.filename.getMime().toString() };
  }
}
