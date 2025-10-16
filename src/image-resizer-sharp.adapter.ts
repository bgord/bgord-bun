import sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";

type Dependencies = { FileRenamer: FileRenamerPort };

export class ImageResizerSharpAdapter implements ImageResizerPort {
  constructor(private readonly deps: Dependencies) {}

  async resize(recipe: ImageResizerStrategy) {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-resized"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline
      .rotate()
      .resize({
        width: recipe.maxSide,
        height: recipe.maxSide,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat(format)
      .toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
