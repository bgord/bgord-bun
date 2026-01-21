import type * as tools from "@bgord/tools";
import type { GzipPort, GzipRecipe } from "./gzip.port";

export class GzipBunAdapter implements GzipPort {
  async pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const file = await Bun.file(recipe.input.get()).arrayBuffer();
    const archive = Bun.gzipSync(file);

    await Bun.write(recipe.output.get(), archive);

    return recipe.output;
  }
}
