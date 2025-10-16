import sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";

type Dependencies = { FileRenamer: FileRenamerPort };

export class ImageAlphaSharpAdapter implements ImageAlphaPort {
  constructor(private readonly deps: Dependencies) {}

  async flatten(recipe: ImageAlphaStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-flattened"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline
      .rotate()
      .flatten({ background: recipe.background })
      .toFormat(format)
      .toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
