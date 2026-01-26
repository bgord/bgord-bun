import type * as tools from "@bgord/tools";
import type sharp from "sharp";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";

export const ImageExifClearSharpAdapterError = {
  MissingDependency: "image.exif.clear.sharp.adapter.error.missing.dependency",
};

type Dependencies = { FileRenamer: FileRenamerPort };
type SharpCallable = typeof sharp;
type SharpModule = { default: SharpCallable };

export class ImageExifClearSharpAdapter implements ImageExifClearPort {
  private constructor(
    private readonly sharp: SharpConstructor,
    private readonly deps: Dependencies,
  ) {}

  static async build(deps: Dependencies): Promise<ImageExifClearSharpAdapter> {
    return new ImageExifClearSharpAdapter(await ImageExifClearSharpAdapter.resolve(), deps);
  }

  private static async resolve(): Promise<SharpConstructor> {
    try {
      return await ImageExifClearSharpAdapter.import();
    } catch {
      throw new Error(ImageExifClearSharpAdapterError.MissingDependency);
    }
  }

  // Stryker disable all
  static async import(): Promise<SharpConstructor> {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name

    return import(name) as Promise<SharpConstructor>;
  }
  // Stryker restore all

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
