import sharp from "sharp";

export type ImageExifClearConfigType = {
  input: string;
  output: string;
};

export class ImageEXIF {
  static async clear(config: ImageExifClearConfigType): Promise<sharp.OutputInfo> {
    return sharp(config.input).rotate().toFile(config.output);
  }
}
