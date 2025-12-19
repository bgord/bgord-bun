import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { ImageInfoNoopAdapter } from "../src/image-info-noop.adapter";

const input = tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg");

const adapter = new ImageInfoNoopAdapter(tools.Mime.fromExtension(tools.Extension.parse("jpeg")));

describe("ImageInfoNoopAdapter", () => {
  test("absolute path", async () => {
    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(400));
    expect(info.height).toEqual(tools.ImageHeight.parse(400));
    expect(info.mime).toBeInstanceOf(tools.Mime);
    expect(info.size).toBeInstanceOf(tools.Size);
  });

  test("relative path", async () => {
    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(400));
    expect(info.height).toEqual(tools.ImageHeight.parse(400));
  });
});
