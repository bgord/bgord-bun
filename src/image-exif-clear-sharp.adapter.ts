import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";

type Dependencies = { FileRenamer: FileRenamerPort };

export class ImageExifClearSharpAdapter implements ImageExifClearPort {
  constructor(private readonly deps: Dependencies) {}

  private async load() {
    return (await import("sharp")).default;
  }

  async clear(recipe: ImageExifClearStrategy) {
    const sharp = await this.load();

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-exif-cleared"));

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
