import type * as tools from "@bgord/tools";
import type {
  ImageFormatterInPlaceStrategy,
  ImageFormatterOutputPathStrategy,
  ImageFormatterPort,
} from "./image-formatter.port";

export class ImageFormatterNoopAdapter implements ImageFormatterPort {
  async format(
    recipe: ImageFormatterInPlaceStrategy | ImageFormatterOutputPathStrategy,
  ): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return recipe.strategy === "output_path"
      ? recipe.output
      : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));
  }
}
