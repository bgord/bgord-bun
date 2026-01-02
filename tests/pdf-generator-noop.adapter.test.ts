import { describe, expect, spyOn, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { PdfGeneratorNoopAdapter, PLACEHOLDER_PDF_BASE64 } from "../src/pdf-generator-noop.adapter";

const Logger = new LoggerNoopAdapter();
const deps = { Logger };

const adapter = new PdfGeneratorNoopAdapter(deps);

describe("CertificateInspectorNoopAdapter", () => {
  test("success", async () => {
    const loggerInfo = spyOn(Logger, "info");

    expect(await adapter.request("welcome", {})).toEqual(Buffer.from(PLACEHOLDER_PDF_BASE64, "base64"));
    expect(loggerInfo).toHaveBeenCalledWith({
      component: "infra",
      operation: "pdf_generator",
      metadata: { data: {}, template: "welcome" },
      message: "[NOOP] PDF generator adapter",
    });
  });
});
