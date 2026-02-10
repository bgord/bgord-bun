import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { PdfGeneratorNoopAdapter } from "../src/pdf-generator-noop.adapter";
import { PdfGeneratorWithLoggerAdapter } from "../src/pdf-generator-with-logger.adapter";
import * as mocks from "./mocks";

const PLACEHOLDER_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoK MiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagoz IDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQy XQovQ29udGVudHMgNSAwIFIKL1Jlc291cmNlcyA8PC9Qcm9jU2V0IFsvUERGIC9UZXh0XQovRm9u dCA8PC9GMSA0IDAgUj4+Cj4+Cj4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUgL0ZvbnQKL1N1YnR5 cGUgL1R5cGUxCi9OYW1lIC9GMQovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL01hY1Jv bWFuRW5jb2RpbmcKPj4KZW5kb2JqCjUgMCBvYmoKPDwvTGVuZ3RoIDUzCj4+CnN0cmVhbQpCVAov RjEgMjAgVGYKMjIwIDQwMCBUZAooRHVtbXkgUERGKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhy ZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZgowMDAwMDAwMDA5IDAwMDAwIG4KMDAwMDAwMDA2MyAw MDAwMCBuCjAwMDAwMDAxMjQgMDAwMDAgbgowMDAwMDAwMjc3IDAwMDAwIG4KMDAwMDAwMDM5MiAw MDAwMCBuCnRyYWlsZXIKPDwvU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0OTUKJSVF T0YK";

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
    const Logger = new LoggerCollectingAdapter();
    const inner = new PdfGeneratorNoopAdapter();
    const adapter = new PdfGeneratorWithLoggerAdapter({ Logger, Clock, inner });
    using _ = spyOn(inner, "request").mockImplementation(mocks.throwIntentionalErrorAsync);

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
