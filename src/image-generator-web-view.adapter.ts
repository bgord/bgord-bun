import type * as tools from "@bgord/tools";
import type { ImageGenerator, ImageGeneratorAcceptedFormat } from "./image-generator.port";

export class ImageGeneratorWebViewAdapter implements ImageGenerator {
  async generate(
    template: string,
    filename: tools.Filename,
    width: tools.ImageWidthType,
    height: tools.ImageHeightType,
  ): Promise<Uint8Array<ArrayBuffer>> {
    await using view = new Bun.WebView({ height, width });

    await view.navigate(`data:text/html;charset=utf-8,${encodeURIComponent(template)}`);

    const image = await view.screenshot({
      encoding: "buffer",
      format: filename.getExtension() as ImageGeneratorAcceptedFormat,
    });

    return new Uint8Array(image);
  }
}
