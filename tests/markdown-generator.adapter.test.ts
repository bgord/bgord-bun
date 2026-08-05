import { describe, expect, test } from "bun:test";
import { MarkdownGeneratorAdapter } from "../src/markdown-generator.adapter";

describe("MarkdownGeneratorAdapter", () => {
  test("generate", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("# Example")).toEqualIgnoringWhitespace("<h1>Example</h1>");
  });

  test("generate - escapes raw html", () => {
    const adapter = new MarkdownGeneratorAdapter();

    expect(adapter.generate("<script>alert(1)</script>")).toEqualIgnoringWhitespace(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
    expect(adapter.generate("<img src=x onerror=alert(2)>")).toEqualIgnoringWhitespace(
      "<p>&lt;img src=x onerror=alert(2)&gt;</p>",
    );
  });
});
