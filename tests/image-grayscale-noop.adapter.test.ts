import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import type {
  ImageGrayscaleInPlaceStrategy,
  ImageGrayscaleOutputPathStrategy,
} from "../src/image-grayscale.port";
import { ImageGrayscaleNoopAdapter } from "../src/image-grayscale-noop.adapter";

const adapter = new ImageGrayscaleNoopAdapter();

describe("ImageGrayscaleNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageGrayscaleInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.grayscale(recipe);

    expect(result).toEqual(input);
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageGrayscaleOutputPathStrategy = { strategy: "output_path", input, output };

    const result = await adapter.grayscale(recipe);

    expect(result).toEqual(output);
  });

  test("in_place - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageGrayscaleInPlaceStrategy = { strategy: "in_place", input };

    expect(await adapter.grayscale(recipe)).toEqual(input);
  });

  test("output_path - relative", async () => {
    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageGrayscaleOutputPathStrategy = { strategy: "output_path", input, output };

    expect(await adapter.grayscale(recipe)).toEqual(output);
  });
});
