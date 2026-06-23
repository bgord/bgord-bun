// cspell:ignore grayscaled
import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageGrayscalePort, ImageGrayscaleStrategy } from "./image-grayscale.port";
import type { NonceProviderPort } from "./nonce-provider.port";

type Dependencies = {
  FileRenamer: FileRenamerPort;
  FileWriter: FileWriterPort;
  NonceProvider: NonceProviderPort;
};

export class ImageGrayscaleAdapter implements ImageGrayscalePort {
  constructor(private readonly deps: Dependencies) {}

  async grayscale(recipe: ImageGrayscaleStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;

    const filename = final.getFilename();
    const temporary = final.withFilename(
      filename.withSuffix(`-grayscale-${this.deps.NonceProvider.generate()}`),
    );

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;

    const grayscaled = await Bun.file(recipe.input.get())
      .image()
      .rotate(0)
      .modulate({ saturation: 0 })
      [format]()
      .bytes();

    await this.deps.FileWriter.write(temporary.get(), grayscaled);
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
