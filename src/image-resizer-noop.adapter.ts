import type * as tools from "@bgord/tools";
import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";

export class ImageResizerNoopAdapter implements ImageResizerPort {
  async resize(recipe: ImageResizerStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
