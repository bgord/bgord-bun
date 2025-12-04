import type { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { ZipFile } from "yazl";
import { FileDraft } from "./file-draft.service";

export class FileDraftZip extends FileDraft {
  private readonly parts: FileDraft[];

  constructor(config: { filename: tools.Filename; parts: FileDraft[] }) {
    super({ filename: config.filename, mime: tools.MIMES.text });
    this.parts = config.parts;
  }

  // @ts-expect-error
  async create(): Promise<Buffer> {
    const zip = new ZipFile();
    const chunks: Buffer[] = [];

    for (const part of this.parts) {
      zip.addReadStream((await part.create()) as Readable, part.config.filename.get());
    }
    zip.end();

    zip.outputStream.on("data", (buffer: Buffer) => chunks.push(buffer));

    return new Promise<Buffer>((resolve, reject) => {
      zip.outputStream.on("end", () => resolve(Buffer.concat(chunks)));
      zip.outputStream.on("error", reject);
    });
  }
}
