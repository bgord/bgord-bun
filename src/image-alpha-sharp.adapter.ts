import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";

export const ImageAlphaSharpAdapterError = {
  MissingDependency: "image.alpha.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type SharpCallable = typeof sharp;
type SharpModule = { default: SharpCallable };

export class ImageAlphaSharpAdapter implements ImageAlphaPort {
  private constructor(
    private readonly sharp: SharpCallable,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageAlphaSharpAdapter> {
    return new ImageAlphaSharpAdapter(await ImageAlphaSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpCallable> {
    try {
      const module = await ImageAlphaSharpAdapter.import();
      return module.default;
    } catch {
      throw new Error(ImageAlphaSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpModule> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name
    return import(name) as Promise<SharpModule>;
  }
  // Stryker restore all

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
