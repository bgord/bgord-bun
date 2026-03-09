import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";

export const ImageResizerSharpAdapterError = {
  MissingDependency: "image.resizer.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageResizerSharpAdapter implements ImageResizerPort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageResizerSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageResizerSharpAdapter> {
    const library = await ImageResizerSharpAdapter.importer.resolve();

    return new ImageResizerSharpAdapter(library.default, deps);
  }

  async resize(recipe: ImageResizerStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-resized"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = this.sharp(recipe.input.get());
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
