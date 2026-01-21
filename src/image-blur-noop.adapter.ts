import type * as tools from "@bgord/tools";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

export class ImageBlurNoopAdapter implements ImageBlurPort {
  async blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
