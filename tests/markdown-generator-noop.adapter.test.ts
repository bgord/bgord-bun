import { describe, expect, test } from "bun:test";
import { MarkdownGeneratorNoopAdapter } from "../src/markdown-generator-noop.adapter";

describe("MarkdownGeneratorNoopAdapter", () => {
  test("generate - default", () => {
    expect(new MarkdownGeneratorNoopAdapter().generate("# Example")).toEqual("");
  });

  test("generate - value", () => {
    expect(new MarkdownGeneratorNoopAdapter("result").generate("# Example")).toEqual("result");
  });
});
