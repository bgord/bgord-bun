import type {
  ImageCompressorInPlaceStrategy,
  ImageCompressorOutputPathStrategy,
  ImageCompressorPort,
} from "./image-compressor.port";

export class ImageCompressorNoopAdapter implements ImageCompressorPort {
  async compress(recipe: ImageCompressorOutputPathStrategy | ImageCompressorInPlaceStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    return final;
  }
}
