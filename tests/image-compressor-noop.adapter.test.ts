import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import type {
  ImageCompressorInPlaceStrategy,
  ImageCompressorOutputPathStrategy,
} from "../src/image-compressor.port";
import { ImageCompressorNoopAdapter } from "../src/image-compressor-noop.adapter";

const adapter = new ImageCompressorNoopAdapter();

describe("ImageCompressorSharpAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.compress(recipe);

    expect(result).toEqual(input);
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageCompressorOutputPathStrategy = { strategy: "output_path", input, output, quality: 73 };

    const result = await adapter.compress(recipe);

    expect(result).toEqual(output);
  });

  test("in_place - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    expect(await adapter.compress(recipe)).toEqual(input);
  });
});
