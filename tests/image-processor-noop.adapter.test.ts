import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { ImageProcessorStrategy } from "../src/image-processor.port";
import { ImageProcessorNoopAdapter } from "../src/image-processor-noop.adapter";

const maxSide = v.parse(tools.ImageWidth, 256);
const adapter = new ImageProcessorNoopAdapter();

describe("ImageProcessorNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/in/photo.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide,
      to: v.parse(tools.Extension, "webp"),
      quality: v.parse(tools.IntegerPositive, 72),
      background: "#FFFFFF",
    };

    expect(await adapter.process(recipe)).toEqual(tools.FilePathAbsolute.fromString("/var/in/photo.webp"));
  });

  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide,
      to: v.parse(tools.Extension, "jpg"),
    };

    const result = await adapter.process(recipe);

    expect(result).toEqual(output);
  });
});
