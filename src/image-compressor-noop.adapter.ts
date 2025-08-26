import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";

export class ImageCompressorNoopAdapter implements ImageCompressorPort {
  async compress(recipe: ImageCompressorStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
