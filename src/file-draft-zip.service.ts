import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { ZipFile } from "yazl";
import { FileDraft } from "./file-draft.service";

export class FileDraftZip extends FileDraft {
  constructor(
    basename: tools.BasenameType,
    private readonly parts: FileDraft[],
  ) {
    super(basename, tools.Extension.parse("zip"), tools.Mimes.zip.mime);
    this.parts = parts;
  }

  // @ts-expect-error
  async create(): Promise<Uint8Array> {
    const zip = new ZipFile();
    const chunks: Buffer[] = [];

    for (const part of this.parts) {
      const body = await part.create();
      const bytes = new Uint8Array(await new Response(body).arrayBuffer());

      zip.addReadStream(Readable.from([bytes]), part.filename.get());
    }
    zip.end();

    zip.outputStream.on("data", (buffer: Buffer) => chunks.push(buffer));

    return new Promise<Uint8Array>((resolve, reject) => {
      zip.outputStream.on("end", () => resolve(Uint8Array.from(Buffer.concat(chunks))));
      zip.outputStream.on("error", reject);
    });
  }
}
