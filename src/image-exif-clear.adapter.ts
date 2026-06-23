// cspell:ignore Exif
import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";
import type { NonceProviderPort } from "./nonce-provider.port";

type Dependencies = {
  FileRenamer: FileRenamerPort;
  FileWriter: FileWriterPort;
  NonceProvider: NonceProviderPort;
};

export class ImageExifClearAdapter implements ImageExifClearPort {
  constructor(private readonly deps: Dependencies) {}

  async clear(recipe: ImageExifClearStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const temporary = final.withFilename(
      final.getFilename().withSuffix(`-exif-cleared-${this.deps.NonceProvider.generate()}`),
    );

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;

    const cleared = await Bun.file(recipe.input.get()).image().rotate(0)[format]().bytes();

    await this.deps.FileWriter.write(temporary.get(), cleared);
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
