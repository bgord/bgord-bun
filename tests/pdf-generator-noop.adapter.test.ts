import { describe, expect, test } from "bun:test";
import { PdfGeneratorNoopAdapter, PLACEHOLDER_PDF_BASE64 } from "../src/pdf-generator-noop.adapter";

describe("PdfGeneratorNoopAdapter", () => {
  test("success", async () => {
    const adapter = new PdfGeneratorNoopAdapter();

    expect(await adapter.request("welcome", {})).toEqual(
      Uint8Array.fromBase64(PLACEHOLDER_PDF_BASE64).buffer,
    );
  });
});
