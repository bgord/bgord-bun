import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

type Dependencies = { FileRenamer: FileRenamerPort };

export class ImageBlurSharpAdapter implements ImageBlurPort {
  constructor(private readonly deps: Dependencies) {}

  private async load() {
    const name = "sha" + "rp"; // Bun does not resolve dynamic imports with a dynamic name
    return (await import(name)).default;
  }

  async blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const sharp = await this.load();

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-blurred"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = sharp(recipe.input.get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.rotate().blur(recipe.sigma).toFormat(format).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
