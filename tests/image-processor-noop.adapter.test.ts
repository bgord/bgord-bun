import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import type { ImageProcessorStrategy } from "../src/image-processor.port";
import { ImageProcessorNoopAdapter } from "../src/image-processor-noop.adapter";

const adapter = new ImageProcessorNoopAdapter();

describe("ImageProcessorNoopAdapter", () => {
  test("in_place", async () => {
    const input = tools.FilePathAbsolute.fromString("/var/in/photo.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide: 256,
      to: tools.Extension.parse("webp"),
      quality: 72,
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
      maxSide: 512,
      to: tools.Extension.parse("jpg"),
    };

    const result = await adapter.process(recipe);

    expect(result).toEqual(output);
  });
});
