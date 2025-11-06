import type { GzipPort, GzipRecipe } from "./gzip.port";

export class GzipNoopAdapter implements GzipPort {
  async pack(recipe: GzipRecipe) {
    return recipe.output;
  }
}
