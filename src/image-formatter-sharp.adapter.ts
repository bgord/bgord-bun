import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";

export const ImageFormatterSharpAdapterError = {
  MissingDependency: "image.formatter.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileCleaner: FileCleanerPort; FileRenamer: FileRenamerPort };
type SharpCallable = typeof sharp;
type SharpModule = { default: SharpCallable };

export class ImageFormatterSharpAdapter implements ImageFormatterPort {
  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageFormatterSharpAdapter> {
    return new ImageFormatterSharpAdapter(await ImageFormatterSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageFormatterSharpAdapter.import();
    } catch {
      throw new Error(ImageFormatterSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }
  // Stryker restore all

  async format(recipe: ImageFormatterStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-formatted"));

    const extension = final.getFilename().getExtension();
    const encoder = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.toFormat(encoder).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await this.deps.FileCleaner.delete(recipe.input.get());
    }

    return final;
  }
}
