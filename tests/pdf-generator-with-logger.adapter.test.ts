import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { PdfGeneratorNoopAdapter, PLACEHOLDER_PDF_BASE64 } from "../src/pdf-generator-noop.adapter";
import { PdfGeneratorWithLoggerAdapter } from "../src/pdf-generator-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PdfGeneratorWithLoggerAdapter", () => {
  test("success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new PdfGeneratorNoopAdapter();
    const adapter = new PdfGeneratorWithLoggerAdapter({ Logger, Clock, inner });

    expect(await adapter.request("welcome", {})).toEqual(
      Uint8Array.fromBase64(PLACEHOLDER_PDF_BASE64).buffer,
    );
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "PDF generator attempt",
        operation: "pdf_generator",
        metadata: { data: {}, template: "welcome" },
      },
      {
        component: "infra",
        message: "PDF generator success",
        operation: "pdf_generator",
        metadata: { size: tools.Size.fromBytes(630), duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("failure", async () => {
    const inner = new PdfGeneratorNoopAdapter();
    using _ = spyOn(inner, "request").mockImplementation(mocks.throwIntentionalErrorAsync);
    const Logger = new LoggerCollectingAdapter();
    const adapter = new PdfGeneratorWithLoggerAdapter({ Logger, Clock, inner });

    expect(async () => adapter.request("welcome", {})).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "PDF generator attempt",
        operation: "pdf_generator",
        metadata: { data: {}, template: "welcome" },
      },
      {
        component: "infra",
        message: "PDF generator error",
        operation: "pdf_generator",
        error: new Error(mocks.IntentionalError),
        metadata: expect.any(tools.Duration),
      },
    ]);
  });
});
