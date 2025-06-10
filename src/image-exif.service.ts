import path from "node:path";
import * as tools from "@bgord/tools";
import mime from "mime-types";
import sharp from "sharp";

import { PathType } from "./path";

export type ImageExifOutputType = {
  width: tools.WidthType;
  height: tools.HeightType;
  name: path.ParsedPath["base"];
  mimeType: tools.MimeRawType;
};

export type ImageExifClearConfigType = {
  input: PathType;
  output: PathType;
};

export class ImageEXIF {
  static async read(input: PathType): Promise<ImageExifOutputType> {
    const image = sharp(input);
    const metadata = await image.metadata();

    const name = path.parse(input).base;

    return {
      width: tools.Width.parse(metadata.width),
      height: tools.Height.parse(metadata.height),
      name,
      mimeType: String(mime.contentType(String(metadata.format))),
    };
  }

  static async clear(config: ImageExifClearConfigType): Promise<sharp.OutputInfo> {
    return sharp(config.input).rotate().toFile(config.output);
  }
}
