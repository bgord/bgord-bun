import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
} from "../src/image-exif-clear.port";
import { ImageExifClearSharpAdapter } from "../src/image-exif-clear-sharp.adapter";

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

const pipeline = {
  rotate: () => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const adapter = new ImageExifClearSharpAdapter(deps);

describe("ImageExifClearSharpAdapter", () => {
  test("in_place", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rotateSpy = spyOn(pipeline, "rotate");
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpeg");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.clear(recipe);

    expect(result).toEqual(input);

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-exif-cleared.jpeg");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, input);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    const result = await adapter.clear(recipe);

    expect(result).toEqual(output);

    const temporary = tools.FilePathAbsolute.fromString("/var/out/dest-exif-cleared.jpeg");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);

    expect(sharpSpy).toHaveBeenCalledWith("/var/img/source.jpeg");
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("in_place - relative", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFileSpy = spyOn(pipeline, "toFile");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageExifClearInPlaceStrategy = { strategy: "in_place", input };

    await adapter.clear(recipe);

    const temporary = tools.FilePathRelative.fromString("images/pic-exif-cleared.png");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - relative", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFileSpy = spyOn(pipeline, "toFile");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("in/source.jpeg");
    const output = tools.FilePathRelative.fromString("out/dest.jpeg");
    const recipe: ImageExifClearOutputPathStrategy = { strategy: "output_path", input, output };

    await adapter.clear(recipe);

    const temporary = tools.FilePathRelative.fromString("out/dest-exif-cleared.jpeg");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);
  });
});
