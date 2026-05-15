import type * as tools from "@bgord/tools";
import type { ImageGenerator } from "./image-generator.port";

export class ImageGeneratorNoopAdapter implements ImageGenerator {
  constructor(private readonly value = new Uint8Array([])) {}

  async generate(
    _template: string,
    _filename: tools.Filename,
    _width: tools.ImageWidthType,
    _height: tools.ImageHeightType,
  ): Promise<Uint8Array<ArrayBuffer>> {
    return this.value;
  }
}
