import type * as tools from "@bgord/tools";
import type { ImageGrayscalePort, ImageGrayscaleStrategy } from "./image-grayscale.port";

export class ImageGrayscaleNoopAdapter implements ImageGrayscalePort {
  async grayscale(recipe: ImageGrayscaleStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
