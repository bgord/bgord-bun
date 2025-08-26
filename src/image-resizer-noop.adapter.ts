import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";

export class ImageResizerNoopAdapter implements ImageResizerPort {
  async resize(recipe: ImageResizerStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
