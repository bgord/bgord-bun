import type { ImageGeneratorConfig, ImageGeneratorPort } from "./image-generator.port";

export class ImageGeneratorNoopAdapter implements ImageGeneratorPort {
  constructor(private readonly value = new Uint8Array([])) {}

  async generate(_config: ImageGeneratorConfig): Promise<Uint8Array<ArrayBuffer>> {
    return this.value;
  }
}
