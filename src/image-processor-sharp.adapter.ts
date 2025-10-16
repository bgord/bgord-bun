import type * as tools from "@bgord/tools";
import sharp from "sharp";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";

type Dependencies = { FileCleaner: FileCleanerPort; FileRenamer: FileRenamerPort };

export class ImageProcessorSharpAdapter implements ImageProcessorPort {
  private static readonly DEFAULT_QUALITY = 85;

  constructor(private readonly deps: Dependencies) {}

  async process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-processed"));

    const extension = final.getFilename().getExtension();
    const encoder = (extension === "jpg" ? "jpeg" : extension) as keyof sharp.FormatEnum;

    const quality = recipe.quality ?? ImageProcessorSharpAdapter.DEFAULT_QUALITY;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    let processor = pipeline.rotate();

    if (recipe.background) {
      processor = processor.flatten({ background: recipe.background as any });
    }

    processor = processor.resize({
      width: recipe.maxSide,
      height: recipe.maxSide,
      fit: "inside",
      withoutEnlargement: true,
    });

    processor = processor.toFormat(encoder, { quality });

    await processor.toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await this.deps.FileCleaner.delete(recipe.input.get());
    }

    return final;
  }
}
