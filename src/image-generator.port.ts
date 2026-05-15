import type * as tools from "@bgord/tools";

export type ImageGeneratorConfig = {
  template: string;
  filename: tools.Filename;
  width: tools.ImageWidthType;
  height: tools.ImageHeightType;
};

export type ImageGeneratorAcceptedFormat = "png" | "jpeg" | "webp";

export interface ImageGenerator {
  generate(config: ImageGeneratorConfig): Promise<Uint8Array<ArrayBuffer>>;
}
