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

describe("ImageExifClearSharpAdapter", () => {
  test("in_place", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.clear(recipe);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/img/photo-exif-cleared.jpeg");
    expect(renameSpy).toHaveBeenCalledWith(temporary, input.get());

    expect(result).toEqual(input);
    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    const result = await adapter.clear(recipe);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/out/dest-exif-cleared.jpeg");
    expect(renameSpy).toHaveBeenCalledWith(temporary, output.get());

    expect(result).toEqual(output);
    expect(sharpSpy).toHaveBeenCalledWith("/var/img/source.jpeg");
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("in_place - relative", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    await adapter.clear(recipe);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("images/pic-exif-cleared.png");
    expect(renameSpy).toHaveBeenCalledWith(temporary, input.get());
  });

  test("output_path - relative", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageExifClearSharpAdapter();

    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    await adapter.clear(recipe);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("out/dest-exif-cleared.jpeg");
    expect(renameSpy).toHaveBeenCalledWith(temporary, output.get());
  });
});
