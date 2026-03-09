import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";

export const ImageExifClearSharpAdapterError = {
  MissingDependency: "image.exif.clear.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageExifClearSharpAdapter implements ImageExifClearPort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageExifClearSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageExifClearSharpAdapter> {
    const library = await ImageExifClearSharpAdapter.importer.resolve();

    return new ImageExifClearSharpAdapter(library.default, deps);
  }

  async clear(recipe: ImageExifClearStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-exif-cleared"));

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
