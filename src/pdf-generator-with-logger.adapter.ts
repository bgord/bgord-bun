import * as tools from "@bgord/tools";
import type { LoggerPort } from "./logger.port";
import type { PdfGeneratorPort, PdfGeneratorTemplateType } from "./pdf-generator.port";

type Dependencies = { Logger: LoggerPort; inner: PdfGeneratorPort };

export class PdfGeneratorWithLoggerAdapter implements PdfGeneratorPort {
  private readonly base = { component: "infra", operation: "pdf_generator" };

  constructor(private readonly deps: Dependencies) {}

  async request(template: PdfGeneratorTemplateType, data: Record<string, unknown>): Promise<ArrayBuffer> {
    try {
      this.deps.Logger.info({ message: "PDF generator attempt", metadata: { template, data }, ...this.base });

      const pdf = await this.deps.inner.request(template, data);
      const size = tools.Size.fromBytes(pdf.byteLength);

      this.deps.Logger.info({ message: "PDF generator success", metadata: size, ...this.base });

      return pdf;
    } catch (error) {
      this.deps.Logger.error({ message: "PDF generator error", error, ...this.base });

      throw error;
    }
  }
}
