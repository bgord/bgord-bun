import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";

type Dependencies = { FileCleaner: FileCleanerPort; FileRenamer: FileRenamerPort };

export class ImageFormatterSharpAdapter implements ImageFormatterPort {
  constructor(private readonly deps: Dependencies) {}

  private async load() {
    return (await import("sharp")).default;
  }

  async format(recipe: ImageFormatterStrategy) {
    const sharp = await this.load();

    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-formatted"));

    const extension = final.getFilename().getExtension();
    const encoder = (extension === "jpg" ? "jpeg" : extension) as keyof import("sharp").FormatEnum;

    const pipeline = sharp((recipe.strategy === "output_path" ? recipe.input : recipe.input).get());
    using _sharp_ = { [Symbol.dispose]: () => pipeline.destroy() };

    await pipeline.toFormat(encoder).toFile(temporary.get());
    await this.deps.FileRenamer.rename(temporary, final);

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await this.deps.FileCleaner.delete(recipe.input.get());
    }

    return final;
  }
}
