import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";

export class ImageAlphaNoopAdapter implements ImageAlphaPort {
  async flatten(recipe: ImageAlphaStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
