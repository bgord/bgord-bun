import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
} from "../src/image-exif-clear.port";
import { ImageExifClearNoopAdapter } from "../src/image-exif-clear-noop.adapter";

const adapter = new ImageExifClearNoopAdapter();

describe("ImageExifClearNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.clear(recipe);

    expect(result).toEqual(input);
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    const result = await adapter.clear(recipe);

    expect(result).toEqual(output);
  });

  test("in_place - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    expect(await adapter.clear(recipe)).toEqual(input);
  });

  test("output_path - relative", async () => {
    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    expect(await adapter.clear(recipe)).toEqual(output);
  });
});
