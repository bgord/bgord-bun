import type * as tools from "@bgord/tools";

export interface ImageGenerator {
  generate(
    template: string,
    filename: tools.Filename,
    width: tools.ImageWidthType,
    height: tools.ImageHeightType,
  ): Promise<Uint8Array<ArrayBuffer>>;
}
