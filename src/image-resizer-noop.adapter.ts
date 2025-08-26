import type {
  ImageResizerInPlaceStrategy,
  ImageResizerOutputPathStrategy,
  ImageResizerPort,
} from "./image-resizer.port";

export class ImageResizerNoopAdapter implements ImageResizerPort {
  async resize(recipe: ImageResizerOutputPathStrategy | ImageResizerInPlaceStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
