import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { ImageInfoSharpAdapter } from "../src/image-info-sharp.adapter";

const adapter = new ImageInfoSharpAdapter();

describe("ImageInfoSharpAdapter", () => {
  test("inspects a JPEG from an absolute path", async () => {
    const instance = { metadata: async () => ({}) as any, destroy: () => {} };
    const metadataSpy = spyOn(instance, "metadata").mockResolvedValue({
      width: 120,
      height: 80,
      format: "jpeg",
    });
    const destroySpy = spyOn(instance, "destroy").mockReturnValue();
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => instance as any);
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue({ size: 1337 } as any);

    const info = await adapter.inspect(tools.FilePathAbsolute.fromString("/var/uploads/avatar.jpeg"));

    expect(info.width).toBe(120 as tools.WidthType);
    expect(info.height).toBe(80 as tools.HeightType);
    expect(info.mime).toBeInstanceOf(tools.Mime);
    expect(info.size).toBeInstanceOf(tools.Size);

    expect(bunFileSpy).toHaveBeenCalledWith("/var/uploads/avatar.jpeg");
    expect(metadataSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);

    sharpSpy.mockRestore();
    bunFileSpy.mockRestore();
  });

  test("inspects a PNG from a relative path", async () => {
    const instance = { metadata: async () => ({}) as any, destroy: () => {} };
    const metadataSpy = spyOn(instance, "metadata").mockResolvedValue({
      width: 64,
      height: 64,
      format: "png",
    });
    const destroySpy = spyOn(instance, "destroy").mockReturnValue();
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => instance as any);
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue({ size: 2048 } as any);

    const info = await adapter.inspect(tools.FilePathRelative.fromString("tmp/icon.png"));

    expect(info.width).toBe(64 as tools.WidthType);
    expect(info.height).toBe(64 as tools.HeightType);
    expect(bunFileSpy).toHaveBeenCalledWith("tmp/icon.png");
    expect(metadataSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);

    sharpSpy.mockRestore();
    bunFileSpy.mockRestore();
  });

  test("propagates VO errors", async () => {
    const instance = { metadata: async () => ({}) as any, destroy: () => {} };
    spyOn(instance, "metadata").mockResolvedValue({ width: 10, height: 10, format: "" });
    const destroySpy = spyOn(instance, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => instance as any);
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue({ size: 1 } as any);

    const pathLike = { get: () => "x" };

    expect(async () => adapter.inspect(pathLike as any)).toThrow();
    expect(destroySpy).toHaveBeenCalledTimes(1);

    sharpSpy.mockRestore();
    bunFileSpy.mockRestore();
  });

  test("propagates VO errors (missing width -> Width.parse throws)", async () => {
    const instance = { metadata: async () => ({}) as any, destroy: () => {} };
    spyOn(instance, "metadata").mockResolvedValue({
      width: undefined,
      height: 10,
      format: "jpeg",
    });
    const destroySpy = spyOn(instance, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => instance as any);
    const bunFileSpy = spyOn(Bun, "file").mockReturnValue({ size: 999 } as any);

    const pathLike = { get: () => "/x.jpeg" };

    expect(async () => adapter.inspect(pathLike as any)).toThrow();
    expect(destroySpy).toHaveBeenCalledTimes(1);

    sharpSpy.mockRestore();
    bunFileSpy.mockRestore();
  });
});
