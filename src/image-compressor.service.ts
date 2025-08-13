import sharp from "sharp";
import { z } from "zod/v4";
import type { PathType } from "../src/path.vo";

export const ImageCompressionQuality = z
  .number()
  .int()
  .min(1)
  .max(100)
  .default(85)
  .brand("ImageCompressionQuality");

type ImageCompressionQualityType = z.infer<typeof ImageCompressionQuality>;

export type ImageCompressorConfigType = {
  input: PathType;
  output: PathType;
  quality?: ImageCompressionQualityType;
};

export class ImageCompressor {
  static async compress(config: ImageCompressorConfigType): Promise<sharp.OutputInfo> {
    const quality = config.quality ?? 85;

    const image = sharp(config.input);
    const metadata = await image.metadata();
    const format = metadata.format as keyof sharp.FormatEnum;

    return image.toFormat(format, { quality }).toFile(config.output);
  }
}
