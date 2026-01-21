import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";
import type * as tools from "@bgord/tools";

export class ImageAlphaNoopAdapter implements ImageAlphaPort {
  async flatten(recipe: ImageAlphaStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
