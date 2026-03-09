import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";

export const ImageAlphaSharpAdapterError = {
  MissingDependency: "image.alpha.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageAlphaSharpAdapter implements ImageAlphaPort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageAlphaSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageAlphaSharpAdapter> {
    const library = await ImageAlphaSharpAdapter.importer.resolve();

    return new ImageAlphaSharpAdapter(library.default, deps);
  }

  async flatten(recipe: ImageAlphaStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-flattened"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = this.sharp(recipe.input.get());
    using _pipeline_dispose = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline
      .rotate()
      .flatten({ background: recipe.background })
      .toFormat(format)
      .toFile(temporary.get());

    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
