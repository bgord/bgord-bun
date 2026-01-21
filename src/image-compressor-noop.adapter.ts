import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";
import type * as tools from "@bgord/tools";

export class ImageCompressorNoopAdapter implements ImageCompressorPort {
  async compress(recipe: ImageCompressorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path" ? recipe.output : recipe.input;
  }
}
