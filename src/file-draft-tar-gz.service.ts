// [BUN DEPENDENCY]
import * as tools from "@bgord/tools";
import { FileDraft } from "./file-draft.service";

export class FileDraftTarGz extends FileDraft {
  constructor(
    basename: tools.BasenameType,
    private readonly parts: ReadonlyArray<FileDraft>,
  ) {
    super(basename, tools.Mimes.tar.extension, tools.Mimes.tar.mime);
  }

  async create(): Promise<BodyInit> {
    const parts: Record<string, Uint8Array> = {};

    for (const part of this.parts) {
      parts[part.filename.get()] = await new Response(await part.create()).bytes();
    }

    return new Bun.Archive(parts, { compress: "gzip" }).blob();
  }
}
