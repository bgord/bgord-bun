import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import type { PdfGeneratorPort, PdfGeneratorTemplateType } from "./pdf-generator.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort; inner: PdfGeneratorPort };

export class PdfGeneratorWithLoggerAdapter implements PdfGeneratorPort {
  private readonly base = { component: "infra", operation: "pdf_generator" };

  constructor(private readonly deps: Dependencies) {}

  async request(template: PdfGeneratorTemplateType, data: Record<string, unknown>): Promise<ArrayBuffer> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({ message: "PDF generator attempt", metadata: { template, data }, ...this.base });

      const pdf = await this.deps.inner.request(template, data);
      const size = tools.Size.fromBytes(pdf.byteLength);

      this.deps.Logger.info({
        message: "PDF generator success",
        metadata: { size, duration: duration.stop() },
        ...this.base,
      });

      return pdf;
    } catch (error) {
      this.deps.Logger.error({
        message: "PDF generator error",
        error,
        metadata: duration.stop(),
        ...this.base,
      });

      throw error;
    }
  }
}
