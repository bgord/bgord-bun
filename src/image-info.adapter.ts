import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";

type Dependencies = { MimeRegistry: tools.MimeRegistry };

export class ImageInfoAdapter implements ImageInfoPort {
  constructor(private readonly deps: Dependencies) {}

  async inspect(input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    const file = Bun.file(input.get());

    const size = tools.Size.fromBytes(file.size);

    const metadata = await file.image().metadata();

    const width = v.parse(tools.ImageWidth, metadata.width);
    const height = v.parse(tools.ImageHeight, metadata.height);
    const extension = v.parse(tools.Extension, metadata.format);

    const mime = this.deps.MimeRegistry.fromExtension(extension);
    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    return { width, height, mime, size };
  }
}
