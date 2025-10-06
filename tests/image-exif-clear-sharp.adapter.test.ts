import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
} from "../src/image-exif-clear.port";
import { ImageExifClearSharpAdapter } from "../src/image-exif-clear-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageExifClearSharpAdapter.clear (standalone, strategy-based)", () => {
  test("in_place: writes temp beside input (based on final) and atomically renames onto input", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.clear(recipe);

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toEqual("/var/img/photo-exif-cleared.jpeg");
    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-exif-cleared.jpeg", "/var/img/photo.jpeg");
    expect(result).toEqual(input);
    expect(sharpSpy).toHaveBeenCalledWith("/var/img/photo.jpeg");
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path: writes temp beside output (based on final) and atomically renames onto output", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    const result = await adapter.clear(recipe);

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toEqual("/var/out/dest-exif-cleared.jpeg");
    expect(renameSpy).toHaveBeenCalledWith("/var/out/dest-exif-cleared.jpeg", "/var/out/dest.jpeg");
    expect(result).toEqual(output);
    expect(sharpSpy).toHaveBeenCalledWith("/var/img/source.jpeg");
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("in_place also works with relative paths", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    await adapter.clear(recipe);

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toEqual("images/pic-exif-cleared.png");
    expect(renameSpy).toHaveBeenCalledWith("images/pic-exif-cleared.png", "images/pic.png");
  });

  test("output_path also works with relative paths", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation((_p: string) => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    await adapter.clear(recipe);

    const tempWritten = (toFileSpy.mock.calls[0] as any[])[0] as string;
    expect(tempWritten).toEqual("out/dest-exif-cleared.jpeg");
    expect(renameSpy).toHaveBeenCalledWith("out/dest-exif-cleared.jpeg", "out/dest.jpeg");
  });
});
