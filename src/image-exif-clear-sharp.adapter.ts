import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";

type Dependencies = { FileRenamer: FileRenamerPort };

export class ImageExifClearSharpAdapter implements ImageExifClearPort {
  constructor(private readonly deps: Dependencies) {}

  private async load() {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name
    return (await import(name)).default;
  }

  async clear(recipe: ImageExifClearStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
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
