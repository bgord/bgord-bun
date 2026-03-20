import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageGrayscalePort, ImageGrayscaleStrategy } from "./image-grayscale.port";

export const ImageGrayscaleSharpAdapterError = {
  MissingDependency: "image.grayscale.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageGrayscaleSharpAdapter implements ImageGrayscalePort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageGrayscaleSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageGrayscaleSharpAdapter> {
    const library = await ImageGrayscaleSharpAdapter.importer.resolve();

    return new ImageGrayscaleSharpAdapter(library.default, deps);
  }

  async grayscale(recipe: ImageGrayscaleStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-grayscale"));

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().grayscale().toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
