import type * as tools from "@bgord/tools";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";

export class ImageProcessorNoopAdapter implements ImageProcessorPort {
  async process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path"
      ? recipe.output
      : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));
  }
}
