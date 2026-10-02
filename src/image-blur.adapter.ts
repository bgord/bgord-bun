// [BUN DEPENDENCY]
import type * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

type Dependencies = {
  AtomicFileWriter: AtomicFileWriterPort;
};

export class ImageBlurAdapter implements ImageBlurPort {
  constructor(private readonly deps: Dependencies) {}

  async blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.output;

    const blurred = await Bun.file(recipe.input.get()).image().placeholder();
    const bytes = Buffer.from(blurred.substring(blurred.indexOf(",") + 1), "base64");

    await this.deps.AtomicFileWriter.write(final, bytes);

    return final;
  }
}
