import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";
import type { NonceProviderPort } from "./nonce-provider.port";

type Dependencies = {
  FileRenamer: FileRenamerPort;
  FileWriter: FileWriterPort;
  NonceProvider: NonceProviderPort;
};

export class ImageCompressorAdapter implements ImageCompressorPort {
  private static readonly DEFAULT_QUALITY = 85;

  constructor(private readonly deps: Dependencies) {}

  async compress(recipe: ImageCompressorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const quality = recipe.quality ?? ImageCompressorAdapter.DEFAULT_QUALITY;

    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(
      filename.withSuffix(`-compressed-${this.deps.NonceProvider.generate()}`),
    );

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;

    const compressed = await Bun.file(recipe.input.get()).image().rotate(0)[format]({ quality }).bytes();

    await this.deps.FileWriter.write(temporary.get(), compressed);
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
