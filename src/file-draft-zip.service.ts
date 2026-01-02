import type { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { ZipFile } from "yazl";
import { FileDraft } from "./file-draft.service";

export class FileDraftZip extends FileDraft {
  constructor(
    basename: tools.BasenameType,
    private readonly parts: FileDraft[],
  ) {
    super(basename, tools.MIMES.zip);
    this.parts = parts;
  }

  // @ts-expect-error
  async create(): Promise<Buffer> {
    const zip = new ZipFile();
    const chunks: Buffer[] = [];

    for (const part of this.parts) {
      zip.addReadStream((await part.create()) as Readable, part.filename.get());
    }
    zip.end();

    // Stryker disable all
    zip.outputStream.on("data", (buffer: Buffer) => chunks.push(buffer));

    return new Promise<Buffer>((resolve, reject) => {
      zip.outputStream.on("end", () => resolve(Buffer.concat(chunks)));
      zip.outputStream.on("error", reject);
    });
    // Stryker restore all
  }
}
