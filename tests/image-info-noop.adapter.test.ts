import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ImageInfoNoopAdapter } from "../src/image-info-noop.adapter";

const input = tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg");
const jpegMime = tools.Mime.fromString("image/jpeg");

const adapter = new ImageInfoNoopAdapter(jpegMime);

describe("ImageInfoNoopAdapter", () => {
  test("absolute path", async () => {
    const info = await adapter.inspect(input);

    expect(info.width).toEqual(v.parse(tools.ImageWidth, 400));
    expect(info.height).toEqual(v.parse(tools.ImageHeight, 400));
    expect(info.mime).toEqual(tools.Mimes.jpg.mime);
    expect(info.size).toEqual(tools.Size.fromBytes(0));
  });

  test("relative path", async () => {
    const info = await adapter.inspect(input);

    expect(info.width).toEqual(v.parse(tools.ImageWidth, 400));
    expect(info.height).toEqual(v.parse(tools.ImageHeight, 400));
  });
});
