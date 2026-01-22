import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { ImageInfoSharpAdapter } from "../src/image-info-sharp.adapter";

const size = { size: 1000 };
const instance = { metadata: async () => ({}), destroy: () => {} };
const input = tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg");

const jpegMime = tools.Mime.fromString("image/jpeg");
const jpgExtension = tools.Extension.parse("jpg");
const jpegExtension = tools.Extension.parse("jpeg");

const MimeRegistry = new tools.MimeRegistry([{ mime: jpegMime, extensions: [jpgExtension, jpegExtension] }]);
const deps = { MimeRegistry };

const adapter = new ImageInfoSharpAdapter(deps);

describe("ImageInfoSharpAdapter", () => {
  test("absolute path", async () => {
    // @ts-expect-error Partial access
    spyOn(_sharp, "default").mockImplementation(() => instance);
    const metadata = spyOn(instance, "metadata").mockResolvedValue({
      width: 120,
      height: 80,
      format: "jpeg",
    });
    const destroy = spyOn(instance, "destroy");
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockReturnValue(size);

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(120));
    expect(info.height).toEqual(tools.ImageHeight.parse(80));
    expect(info.mime).toBeInstanceOf(tools.Mime);
    expect(info.size).toBeInstanceOf(tools.Size);
    expect(bunFile).toHaveBeenCalledWith(input.get());
    expect(metadata).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("relative path", async () => {
    // @ts-expect-error Partial access
    spyOn(_sharp, "default").mockImplementation(() => instance);
    const metadata = spyOn(instance, "metadata").mockResolvedValue({ width: 64, height: 64, format: "jpg" });
    const destroy = spyOn(instance, "destroy");
    // @ts-expect-error TODO
    const bunFile = spyOn(Bun, "file").mockReturnValue(size);

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(64));
    expect(info.height).toEqual(tools.ImageHeight.parse(64));
    expect(bunFile).toHaveBeenCalledWith(input.get());
    expect(metadata).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("error - extension empty", async () => {
    // @ts-expect-error Partial access
    spyOn(_sharp, "default").mockImplementation(() => instance);
    spyOn(instance, "metadata").mockResolvedValue({ width: 10, height: 10, format: "" });
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockReturnValue(size);
    const destroy = spyOn(instance, "destroy");

    expect(async () => adapter.inspect(input)).toThrow(tools.ExtensionError.Empty);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("error - width", async () => {
    // @ts-expect-error Partial access
    spyOn(_sharp, "default").mockImplementation(() => instance);
    spyOn(instance, "metadata").mockResolvedValue({ width: undefined, height: 10, format: "jpeg" });
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockReturnValue(size);
    const destroy = spyOn(instance, "destroy");

    expect(async () => adapter.inspect(input)).toThrow(tools.ImageWidthError.Type);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("error - mime not found", async () => {
    // @ts-expect-error Partial access
    spyOn(_sharp, "default").mockImplementation(() => instance);
    spyOn(instance, "metadata").mockResolvedValue({ width: 10, height: 10, format: "png" });
    // @ts-expect-error TODO
    spyOn(Bun, "file").mockReturnValue(size);
    const destroy = spyOn(instance, "destroy");

    expect(async () => adapter.inspect(input)).toThrow(tools.MimeRegistryError.MimeNotFound);
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
