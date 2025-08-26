import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
  ImageExifClearPort,
} from "./image-exif-clear.port";

export class ImageExifClearNoopAdapter implements ImageExifClearPort {
  async clear(recipe: ImageExifClearInPlaceStrategy | ImageExifClearOutputPathStrategy) {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
