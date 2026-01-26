import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";

export const ImageResizerSharpAdapterError = {
  MissingDependency: "image.resizer.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type SharpConstructor = typeof import("sharp");
type SharpCallable = typeof sharp;
type SharpModule = { default: SharpCallable };

export class ImageResizerSharpAdapter implements ImageResizerPort {
  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageResizerSharpAdapter> {
    return new ImageResizerSharpAdapter(await ImageResizerSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageResizerSharpAdapter.import();
    } catch {
      throw new Error(ImageResizerSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }
  // Stryker restore all

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
