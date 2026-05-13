import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";

type Dependencies = { FileRenamer: FileRenamerPort; FileWriter: FileWriterPort };

export class ImageBlurAdapter implements ImageBlurPort {
  constructor(private readonly deps: Dependencies) {}

  async blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const temporary = final.withFilename(final.getFilename().withSuffix("-blurred"));

    // TODO format
    const blurred = await Bun.file(recipe.input.get()).image().placeholder();
    const bytes = Buffer.from(blurred.substring(blurred.indexOf(",") + 1), "base64");

    await this.deps.FileWriter.write(temporary.get(), bytes);
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
