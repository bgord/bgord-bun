// [BUN DEPENDENCY]
import type * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";

type Dependencies = {
  AtomicFileWriter: AtomicFileWriterPort;
};

export class ImageCompressorAdapter implements ImageCompressorPort {
  private static readonly DEFAULT_QUALITY = 85;

  constructor(private readonly deps: Dependencies) {}

  async compress(recipe: ImageCompressorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const quality = recipe.quality ?? ImageCompressorAdapter.DEFAULT_QUALITY;

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;

    const compressed = await Bun.file(recipe.input.get()).image().rotate(0)[format]({ quality }).bytes();

    await this.deps.AtomicFileWriter.write(final, compressed);

    return final;
  }
}
