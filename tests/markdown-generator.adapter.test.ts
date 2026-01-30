import { describe, expect, test } from "bun:test";
import { MarkdownGeneratorAdapter } from "../src/markdown-generator.adapter";

describe("MarkdownGeneratorAdapter", () => {
  test("generate", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("# Example")).toEqualIgnoringWhitespace("<h1>Example</h1>");
  });
});
