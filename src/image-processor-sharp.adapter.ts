import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";

export const ImageProcessorSharpAdapterError = {
  MissingDependency: "image.processor.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileCleaner: FileCleanerPort; FileRenamer: FileRenamerPort };
type SharpConstructor = typeof import("sharp");

export class ImageProcessorSharpAdapter implements ImageProcessorPort {
  private static readonly DEFAULT_QUALITY = 85;

  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageProcessorSharpAdapter> {
    return new ImageProcessorSharpAdapter(await ImageProcessorSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageProcessorSharpAdapter.import();
    } catch {
      throw new Error(ImageProcessorSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }
  // Stryker restore all

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
