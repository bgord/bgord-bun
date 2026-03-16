import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";
import { ImageFormatterNoopAdapter } from "../src/image-formatter-noop.adapter";

const adapter = new ImageFormatterNoopAdapter();

describe("ImageFormatterNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
    const to = v.parse(tools.Extension, "webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    const result = await adapter.format(recipe);

    const formatted = tools.FilePathAbsolute.fromString("/var/in/img.webp");

    expect(result.get()).toEqual(formatted.get());
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/in/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    const result = await adapter.format(recipe);

    expect(result.get()).toEqual(output.get());
  });

  test("in_place - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const to = v.parse(tools.Extension, "png");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    expect(await adapter.format(recipe)).toEqual(input);
  });
});
