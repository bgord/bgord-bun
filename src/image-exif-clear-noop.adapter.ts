import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";
import type * as tools from "@bgord/tools";

export class ImageExifClearNoopAdapter implements ImageExifClearPort {
  async clear(recipe: ImageExifClearStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
