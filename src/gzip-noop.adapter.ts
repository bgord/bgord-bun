import type * as tools from "@bgord/tools";
import type { GzipPort, GzipRecipe } from "./gzip.port";

export class GzipNoopAdapter implements GzipPort {
  async pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.output;
  }
}
