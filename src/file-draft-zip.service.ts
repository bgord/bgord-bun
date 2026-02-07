import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import { FileDraft } from "./file-draft.service";

export const FileDraftZipError = {
  MissingDependency: "file.draft.zip.error.missing.dependency",
};

type YazlLibrary = typeof import("yazl");

export class FileDraftZip extends FileDraft {
  private constructor(
    basename: tools.BasenameType,
    private readonly parts: ReadonlyArray<FileDraft>,
    private readonly yazl: YazlLibrary,
  ) {
    super(basename, tools.Extension.parse("zip"), tools.Mimes.zip.mime);
  }

  static async build(basename: tools.BasenameType, parts: ReadonlyArray<FileDraft>): Promise<FileDraftZip> {
    return new FileDraftZip(basename, parts, await FileDraftZip.resolve());
  }

  private static async resolve(): Promise<YazlLibrary> {
    try {
      return await FileDraftZip.import();
    } catch {
      throw new Error(FileDraftZipError.MissingDependency);
    }
  }

  static async import(): Promise<YazlLibrary> {
    const name = "ya" + "zl"; // Bun does not resolve dynamic imports with a dynamic name
    return import(name) as Promise<YazlLibrary>;
  }

  async create(): Promise<BodyInit> {
    const zip = new this.yazl.ZipFile();
    const chunks: Array<Buffer> = [];

    zip.outputStream.on("data", (buffer: Buffer) => chunks.push(buffer));

    const output = new Promise<BodyInit>((resolve, reject) => {
      zip.outputStream.on("end", () => resolve(Uint8Array.from(Buffer.concat(chunks))));
      // Stryker disable all
      zip.outputStream.on("error", reject);
      // Stryker restore all
    });

    for (const part of this.parts) {
      const body = await part.create();
      const bytes = new Uint8Array(await new Response(body).arrayBuffer());

      zip.addReadStream(Readable.from([bytes]), part.filename.get());
    }

    zip.end();

    return output;
  }
}
