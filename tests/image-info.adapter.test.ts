import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ImageInfoAdapter } from "../src/image-info.adapter";

const size = tools.Size.fromBytes(1024);
const input = tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg");

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = v.parse(tools.Extension, "jpg");
const jpegExtension = v.parse(tools.Extension, "jpeg");

const metadata = { width: 120, height: 80, format: "jpeg" };

const MimeRegistry = new tools.MimeRegistry([{ mime: jpegMime, extensions: [jpgExtension, jpegExtension] }]);
const deps = { MimeRegistry };

const adapter = new ImageInfoAdapter(deps);

describe("ImageInfoAdapter", () => {
  test("absolute path", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      size: size.toBytes(),
      // @ts-expect-error Partial access
      image: () => ({ metadata: async () => metadata }),
    });

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(v.parse(tools.ImageWidth, metadata.width));
    expect(info.height).toEqual(v.parse(tools.ImageHeight, metadata.height));
    expect(info.mime).toEqual(jpegMime);
    expect(info.size).toEqual(size);
  });

  test("relative path", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      size: size.toBytes(),
      // @ts-expect-error Partial access
      image: () => ({ metadata: async () => metadata }),
    });

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(v.parse(tools.ImageWidth, metadata.width));
    expect(info.height).toEqual(v.parse(tools.ImageHeight, metadata.height));
    expect(info.mime).toEqual(jpegMime);
    expect(info.size).toEqual(size);
  });

  test("error - extension empty", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      size: size.toBytes(),
      image: () => ({
        // @ts-expect-error Partial access
        metadata: async () => ({ ...metadata, format: "" }),
      }),
    });

    expect(async () => adapter.inspect(input)).toThrow(tools.ExtensionError.Empty);
  });

  test("error - width", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      size: size.toBytes(),
      image: () => ({
        // @ts-expect-error Partial access
        metadata: async () => ({ ...metadata, width: undefined }),
      }),
    });

    expect(async () => adapter.inspect(input)).toThrow(tools.ImageWidthError.Type);
  });

  test("error - height", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      size: size.toBytes(),
      image: () => ({
        // @ts-expect-error Partial access
        metadata: async () => ({ ...metadata, height: undefined }),
      }),
    });

    expect(async () => adapter.inspect(input)).toThrow(tools.ImageHeightError.Type);
  });

  test("error - mime not found", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      size: size.toBytes(),
      // @ts-expect-error Partial access
      image: () => ({ metadata: async () => ({ ...metadata, format: "png" }) }),
    });

    expect(async () => adapter.inspect(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
  });
});
