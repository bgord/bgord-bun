import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

export class ImageBlurNoopAdapter implements ImageBlurPort {
  async blur(recipe: ImageBlurStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
