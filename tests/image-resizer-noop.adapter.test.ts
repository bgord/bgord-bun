import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import type { ImageResizerInPlaceStrategy, ImageResizerOutputPathStrategy } from "../src/image-resizer.port";
import { ImageResizerNoopAdapter } from "../src/image-resizer-noop.adapter";

const adapter = new ImageResizerNoopAdapter();

describe("ImageResizerSharpAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 512 };

    expect(await adapter.resize(recipe)).toEqual(input);
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageResizerOutputPathStrategy = { strategy: "output_path", input, output, maxSide: 256 };

    expect(await adapter.resize(recipe)).toEqual(output);
  });

  test("in_place - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 128 };

    expect(await adapter.resize(recipe)).toEqual(input);
  });
});
