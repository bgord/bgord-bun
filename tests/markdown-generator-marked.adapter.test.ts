import { describe, expect, test } from "bun:test";
import { MarkdownGeneratorMarkedAdapter } from "../release-candidates/markdown-generator-marked.adapter";

const adapter = new MarkdownGeneratorMarkedAdapter();

describe.skip("MarkdownGeneratorMarkedAdapter", () => {
  test("happy path", async () => {
    expect(await adapter.generate("**Hello world**")).toEqualIgnoringWhitespace(
      "<p><strong>Hello world</strong></p>",
    );
  });

  test("sanitization", async () => {
    expect(
      await adapter.generate(`<img src="example.com" onerror="alert('not happening')">`),
    ).toEqualIgnoringWhitespace(`<img src="example.com">`);
  });
});
