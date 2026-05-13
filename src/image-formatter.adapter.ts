import type * as tools from "@bgord/tools";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";

type Dependencies = {
  FileCleaner: FileCleanerPort;
  FileRenamer: FileRenamerPort;
  FileWriter: FileWriterPort;
};

export class ImageFormatterAdapter implements ImageFormatterPort {
  constructor(private readonly deps: Dependencies) {}

  async format(recipe: ImageFormatterStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const temporary = final.withFilename(final.getFilename().withSuffix("-formatted"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;

    const bytes = await Bun.file(recipe.input.get()).image().rotate(0)[format]().bytes();

    await this.deps.FileWriter.write(temporary.get(), bytes);
    await this.deps.FileRenamer.rename(temporary, final);

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await this.deps.FileCleaner.delete(recipe.input.get());
    }

    return final;
  }
}
