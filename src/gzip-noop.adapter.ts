import type { GzipPort, GzipRecipe } from "./gzip.port";
import type * as tools from "@bgord/tools";

export class GzipNoopAdapter implements GzipPort {
  async pack(recipe: GzipRecipe): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.output;
  }
}
