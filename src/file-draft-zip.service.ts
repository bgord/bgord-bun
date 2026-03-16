import { Readable } from "node:stream";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { DynamicImport } from "./dynamic-import.service";
import { FileDraft } from "./file-draft.service";

export const FileDraftZipError = {
  MissingDependency: "file.draft.zip.error.missing.dependency",
};

type YazlLibrary = typeof import("yazl");

export class FileDraftZip extends FileDraft {
  private static readonly importer = DynamicImport.for<YazlLibrary>(
    "yazl",
    FileDraftZipError.MissingDependency,
  );

  private constructor(
    basename: tools.BasenameType,
    private readonly parts: ReadonlyArray<FileDraft>,
    private readonly yazl: YazlLibrary,
  ) {
    super(basename, v.parse(tools.Extension, "zip"), tools.Mimes.zip.mime);
  }

  static async build(basename: tools.BasenameType, parts: ReadonlyArray<FileDraft>): Promise<FileDraftZip> {
    const library = await FileDraftZip.importer.resolve();
    return new FileDraftZip(basename, parts, library);
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
