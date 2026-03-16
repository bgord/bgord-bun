import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";

export class ImageInfoNoopAdapter implements ImageInfoPort {
  constructor(private readonly mime: tools.Mime) {}

  async inspect(_input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    return {
      width: v.parse(tools.ImageWidth, 400),
      height: v.parse(tools.ImageHeight, 400),
      mime: this.mime,
      size: tools.Size.fromBytes(0),
    };
  }
}
