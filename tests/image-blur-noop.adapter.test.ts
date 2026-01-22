import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurNoopAdapter } from "../src/image-blur-noop.adapter";

const adapter = new ImageBlurNoopAdapter();

describe("ImageBlurNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    const result = await adapter.blur(recipe);

    expect(result).toEqual(input);
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 2.5 };

    const result = await adapter.blur(recipe);

    expect(result).toEqual(output);
  });

  test("in_place - relateive", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input, sigma: 1 };

    const result = await adapter.blur(recipe);

    expect(result.get()).toEqual(input.get());
  });

  test("output_path - jpeg to jpg", async () => {
    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 0.7 };

    expect(await adapter.blur(recipe)).toEqual(output);
  });
});
