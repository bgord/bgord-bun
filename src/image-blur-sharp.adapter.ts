import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import { DynamicImport } from "./dynamic-import.service";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

export const ImageBlurSharpAdapterError = {
  MissingDependency: "image.blur.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type Sharp = typeof sharp;

export class ImageBlurSharpAdapter implements ImageBlurPort {
  private static readonly importer = DynamicImport.for<{ default: Sharp }>(
    "sharp",
    ImageBlurSharpAdapterError.MissingDependency,
  );

  private constructor(
    private readonly sharp: Sharp,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageBlurSharpAdapter> {
    const library = await ImageBlurSharpAdapter.importer.resolve();

    return new ImageBlurSharpAdapter(library.default, deps);
  }

  async blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-blurred"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().blur(recipe.sigma).toFormat(format).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
