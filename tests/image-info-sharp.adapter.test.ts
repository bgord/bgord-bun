import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { ImageInfoSharpAdapter } from "../src/image-info-sharp.adapter";

const adapter = new ImageInfoSharpAdapter();

const size = { size: 1000 } as any;
const input = tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg");
const instance = { metadata: async () => ({}) as any, destroy: () => {} };

describe("ImageInfoSharpAdapter", () => {
  test("absolute path", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => instance);
    const metadataSpy = spyOn(instance, "metadata").mockResolvedValue({
      width: 120,
      height: 80,
      format: "jpeg",
    });
    const destroySpy = spyOn(instance, "destroy");
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(size);

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(120));
    expect(info.height).toEqual(tools.ImageHeight.parse(80));
    expect(info.mime).toBeInstanceOf(tools.Mime);
    expect(info.size).toBeInstanceOf(tools.Size);

    expect(bunFileSpy).toHaveBeenCalledWith(input.get());
    expect(metadataSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("relative path", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => instance);
    const metadataSpy = spyOn(instance, "metadata").mockResolvedValue({
      width: 64,
      height: 64,
      format: "png",
    });
    const destroySpy = spyOn(instance, "destroy");
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue(size);

    const info = await adapter.inspect(input);

    expect(info.width).toEqual(tools.ImageWidth.parse(64));
    expect(info.height).toEqual(tools.ImageHeight.parse(64));
    expect(bunFileSpy).toHaveBeenCalledWith(input.get());
    expect(metadataSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("error - extension empty", async () => {
    spyOn(instance, "metadata").mockResolvedValue({ width: 10, height: 10, format: "" });
    const destroySpy = spyOn(instance, "destroy");

    spyOn(sharpModule as any, "default").mockImplementation(() => instance);
    spyOn(Bun, "file").mockReturnValue(size);

    expect(async () => adapter.inspect(input)).toThrow(tools.ExtensionError.Empty);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("error - width", async () => {
    spyOn(instance, "metadata").mockResolvedValue({ width: undefined, height: 10, format: "jpeg" });
    const destroySpy = spyOn(instance, "destroy");

    spyOn(sharpModule as any, "default").mockImplementation(() => instance);
    spyOn(Bun, "file").mockReturnValue(size);

    expect(async () => adapter.inspect(input)).toThrow(tools.ImageWidthError.Type);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
