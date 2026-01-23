import type * as tools from "@bgord/tools";
import type { FileReaderRawPort } from "./file-reader-raw.port";
import type { FileWriterPort } from "./file-writer.port";
import type { GzipPort, GzipRecipe } from "./gzip.port";

type Dependencies = { FileReaderRaw: FileReaderRawPort; FileWriter: FileWriterPort };

export class GzipAdapter implements GzipPort {
  constructor(private readonly deps: Dependencies) {}

  async pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const file = await this.deps.FileReaderRaw.read(recipe.input);
    const archive = Bun.gzipSync(file);

    await this.deps.FileWriter.write(recipe.output, archive);

    return recipe.output;
  }
}
