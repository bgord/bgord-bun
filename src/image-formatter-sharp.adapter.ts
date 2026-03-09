import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";

export const ImageFormatterSharpAdapterError = {
  MissingDependency: "image.formatter.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileCleaner: FileCleanerPort; FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageFormatterSharpAdapter implements ImageFormatterPort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageFormatterSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageFormatterSharpAdapter> {
    const library = await ImageFormatterSharpAdapter.importer.resolve();

    return new ImageFormatterSharpAdapter(library.default, deps);
  }

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
