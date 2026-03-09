import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";

export const ImageProcessorSharpAdapterError = {
  MissingDependency: "image.processor.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileCleaner: FileCleanerPort; FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageProcessorSharpAdapter implements ImageProcessorPort {
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageProcessorSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageProcessorSharpAdapter> {
    const library = await ImageProcessorSharpAdapter.importer.resolve();

    return new ImageProcessorSharpAdapter(library.default, deps);
  }

  async process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-processed"));

    const extension = final.getFilename().getExtension();
    const encoder = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const quality = recipe.quality ?? ImageProcessorSharpAdapter.DEFAULT_QUALITY;

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    let processor = pipeline.rotate();

    if (recipe.background) {
      processor = processor.flatten({ background: recipe.background });
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
