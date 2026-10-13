// [BUN DEPENDENCY]
import type {
  ImageGeneratorAcceptedFormat,
  ImageGeneratorConfig,
  ImageGeneratorPort,
} from "./image-generator.port";

export class ImageGeneratorWebViewAdapter implements ImageGeneratorPort {
  static readonly CSP =
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: http: https:; font-src data:">`;

  async generate(config: ImageGeneratorConfig): Promise<Uint8Array<ArrayBuffer>> {
    await using view = new Bun.WebView(config);

    const html = ImageGeneratorWebViewAdapter.CSP + config.template;

    await view.navigate(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    const image = await view.screenshot({
      encoding: "buffer",
      format: config.filename.getExtension() as ImageGeneratorAcceptedFormat,
    });

    return new Uint8Array(image);
  }
}
