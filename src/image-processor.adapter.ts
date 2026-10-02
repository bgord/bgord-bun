// [BUN DEPENDENCY]
import type * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";

type Dependencies = {
  AtomicFileWriter: AtomicFileWriterPort;
  FileCleaner: FileCleanerPort;
};

export class ImageProcessorAdapter implements ImageProcessorPort {
  private static readonly DEFAULT_QUALITY = 85;

  constructor(private readonly deps: Dependencies) {}

  async process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final =
      recipe.strategy === "output_path"
        ? recipe.output
        : recipe.input.withFilename(recipe.input.getFilename().withExtension(recipe.to));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;
    const quality = recipe.quality ?? ImageProcessorAdapter.DEFAULT_QUALITY;

    const processed = await Bun.file(recipe.input.get())
      .image()
      .rotate(0)
      .resize(recipe.maxSide, recipe.maxSide, { fit: "inside", withoutEnlargement: true })
      [format]({ quality })
      .bytes();

    await this.deps.AtomicFileWriter.write(final, processed);

    if (recipe.strategy === "in_place" && final.get() !== recipe.input.get()) {
      await this.deps.FileCleaner.delete(recipe.input.get());
    }

    return final;
  }
}
