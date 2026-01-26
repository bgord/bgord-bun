import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";

export const ImageCompressorSharpAdapterError = {
  MissingDependency: "image.compressor.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type SharpConstructor = typeof import("sharp");
type SharpCallable = typeof sharp;
type SharpModule = { default: SharpCallable };

export class ImageCompressorSharpAdapter implements ImageCompressorPort {
  private static readonly DEFAULT_QUALITY = 85;

  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageCompressorSharpAdapter> {
    return new ImageCompressorSharpAdapter(await ImageCompressorSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageCompressorSharpAdapter.import();
    } catch {
      throw new Error(ImageCompressorSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }
  // Stryker restore all

  async compress(recipe: ImageCompressorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const quality = recipe.quality ?? ImageCompressorSharpAdapter.DEFAULT_QUALITY;

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-compressed"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = this.sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().toFormat(format, { quality }).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
