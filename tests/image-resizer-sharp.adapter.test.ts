import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageResizerInPlaceStrategy, ImageResizerOutputPathStrategy } from "../src/image-resizer.port";
import { ImageResizerSharpAdapter } from "../src/image-resizer-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  resize: (_opts: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageResizerSharpAdapter.resize", () => {
  test("in_place: resizes to maxSide with fit=inside, maps jpg→jpeg, temp next to final, atomic rename", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const resizeSpy = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageResizerSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg"); // jpg should map to jpeg encoder
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 512 };

    const result = await adapter.resize(recipe);

    expect(resizeSpy).toHaveBeenCalledTimes(1);
    const [resizeOpts] = resizeSpy.mock.calls[0] as any[];
    expect(resizeOpts).toMatchObject({
      width: 512,
      height: 512,
      fit: "inside",
      withoutEnlargement: true,
    });

    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("jpeg");

    expect(toFileSpy).toHaveBeenCalledTimes(1);
    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/var/img/photo-resized.jpg");
    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-resized.jpg", "/var/img/photo.jpg");

    expect(result).toBe(input);

    expect(sharpSpy).toHaveBeenCalledWith("/var/img/photo.jpg");
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path: uses final extension for encoder, resizes to maxSide, temp beside output, atomic rename", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const resizeSpy = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageResizerSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageResizerOutputPathStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: 256,
    };

    const result = await adapter.resize(recipe);

    const [resizeOpts] = resizeSpy.mock.calls[0] as any[];
    expect(resizeOpts).toMatchObject({
      width: 256,
      height: 256,
      fit: "inside",
      withoutEnlargement: true,
    });

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("webp");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("/out/dest-resized.webp");
    expect(renameSpy).toHaveBeenCalledWith("/out/dest-resized.webp", "/out/dest.webp");

    expect(result).toBe(output);
  });

  test("relative in_place: writes temp beside relative final and renames", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageResizerSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 128 };

    await adapter.resize(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("png");

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toBe("images/pic-resized.png");
    expect(renameSpy).toHaveBeenCalledWith("images/pic-resized.png", "images/pic.png");
  });

  test("jpg→jpeg encoder mapping also applies in output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageResizerSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/a/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/b/out/photo.jpg"); // jpg → jpeg
    const recipe: ImageResizerOutputPathStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: 300,
    };

    await adapter.resize(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toBe("jpeg");

    expect(renameSpy).toHaveBeenCalledWith("/b/out/photo-resized.jpg", "/b/out/photo.jpg");
  });
});
