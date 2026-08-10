import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ImageBlurNoopAdapter } from "../src/image-blur-noop.adapter";

const adapter = new ImageBlurNoopAdapter();

describe("ImageBlurNoopAdapter", () => {
  test("output_path", async () => {
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");

    const result = await adapter.blur({ input, output });

    expect(result).toEqual(output);
  });

  test("output_path - relative", async () => {
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const output = tools.FilePathRelative.fromString("images/pic-blurred.png");

    const result = await adapter.blur({ input, output });

    expect(result.get()).toEqual(output.get());
  });

  test("output_path - jpeg to jpg", async () => {
    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");

    expect(await adapter.blur({ input, output })).toEqual(output);
  });
});
