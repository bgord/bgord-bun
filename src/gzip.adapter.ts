import type * as tools from "@bgord/tools";
import type { FileReaderRawPort } from "./file-reader-raw.port";
import type { GzipPort, GzipRecipe } from "./gzip.port";

type Dependencies = { FileReaderRaw: FileReaderRawPort };

export class GzipAdapter implements GzipPort {
  constructor(private readonly deps: Dependencies) {}

  async pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const file = await this.deps.FileReaderRaw.read(recipe.input);
    const archive = Bun.gzipSync(file);

    await Bun.write(recipe.output.get(), archive);

    return recipe.output;
  }
}
