import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";

export class ImageExifClearNoopAdapter implements ImageExifClearPort {
  async clear(recipe: ImageExifClearStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
