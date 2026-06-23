import type {
  ImageGeneratorAcceptedFormat,
  ImageGeneratorConfig,
  ImageGeneratorPort,
} from "./image-generator.port";

export class ImageGeneratorWebViewAdapter implements ImageGeneratorPort {
  async generate(config: ImageGeneratorConfig): Promise<Uint8Array<ArrayBuffer>> {
    await using view = new Bun.WebView(config);

    // TODO: Potential XSS risk
    await view.navigate(`data:text/html;charset=utf-8,${encodeURIComponent(config.template)}`);

    const image = await view.screenshot({
      encoding: "buffer",
      format: config.filename.getExtension() as ImageGeneratorAcceptedFormat,
    });

    return new Uint8Array(image);
  }
}
