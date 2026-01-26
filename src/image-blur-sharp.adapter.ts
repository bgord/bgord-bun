import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

export const ImageBlurSharpAdapterError = {
  MissingDependency: "image.blur.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type SharpConstructor = typeof import("sharp");

export class ImageBlurSharpAdapter implements ImageBlurPort {
  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageBlurSharpAdapter> {
    return new ImageBlurSharpAdapter(await ImageBlurSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageBlurSharpAdapter.import();
    } catch {
      throw new Error(ImageBlurSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }
  // Stryker restore all

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
