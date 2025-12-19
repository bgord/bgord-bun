import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import type { ImageAlphaStrategy } from "../src/image-alpha.port";
import { ImageAlphaNoopAdapter } from "../src/image-alpha-noop.adapter";

const adapter = new ImageAlphaNoopAdapter();

describe("ImageAlphaNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#F8FAFC" };

    const output = await adapter.flatten(recipe);

    expect(output).toEqual(input);
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const background = { r: 248, g: 250, b: 252, alpha: 1 };
    const recipe: ImageAlphaStrategy = { strategy: "output_path", input, output, background };

    const result = await adapter.flatten(recipe);

    expect(result).toEqual(output);
  });

  test("in_place - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageAlphaStrategy = { strategy: "in_place", input, background: "#000" };

    const result = await adapter.flatten(recipe);

    expect(result).toEqual(input);
  });
});
