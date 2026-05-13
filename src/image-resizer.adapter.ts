import type * as tools from "@bgord/tools";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { ImageSupportedType } from "./image.types";
import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";

type Dependencies = { FileWriter: FileWriterPort; FileRenamer: FileRenamerPort };

export class ImageResizerAdapter implements ImageResizerPort {
  constructor(private readonly deps: Dependencies) {}

  async resize(recipe: ImageResizerStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    const final = recipe.strategy === "output_path" ? recipe.output : recipe.input;
    const filename = final.getFilename();
    const temporary = final.withFilename(filename.withSuffix("-resized"));

    const extension = final.getFilename().getExtension();
    const format = (extension === "jpg" ? "jpeg" : extension) as ImageSupportedType;

    const resized = await Bun.file(recipe.input.get())
      .image()
      .resize(recipe.maxSide, recipe.maxSide, { fit: "inside", withoutEnlargement: true })
      [format]()
      .bytes();

    await this.deps.FileWriter.write(temporary.get(), resized);
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }
}
