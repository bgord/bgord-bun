import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type {
  ImageCompressorInPlaceStrategy,
  ImageCompressorOutputPathStrategy,
} from "../src/image-compressor.port";
import { ImageCompressorSharpAdapter } from "../src/image-compressor-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  toFormat: (_format: any, _opts?: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageCompressorSharpAdapter", () => {
  test("in_place", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    const result = await adapter.compress(recipe);

    const [format, options] = toFormatSpy.mock.calls[0];
    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    expect(format).toEqual("jpeg");
    expect(options).toMatchObject({ quality: 85 });

    expect(toFileSpy).toHaveBeenCalledTimes(1);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/img/photo-compressed.jpg");

    expect(renameSpy).toHaveBeenCalledWith(temporary, input.get());

    expect(result).toEqual(input);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageCompressorOutputPathStrategy = { strategy: "output_path", input, output, quality: 73 };

    const result = await adapter.compress(recipe);

    const [format, options] = toFormatSpy.mock.calls[0];
    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    expect(format).toEqual("webp");
    expect(options).toMatchObject({ quality: 73 });

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/out/dest-compressed.webp");

    expect(renameSpy).toHaveBeenCalledWith(temporary, output.get());

    expect(result).toEqual(output);
  });

  test("in_place - relative", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageCompressorInPlaceStrategy = { strategy: "in_place", input };

    await adapter.compress(recipe);

    const [format, options] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("png");
    expect(options).toMatchObject({ quality: 85 });

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("images/pic-compressed.png");

    expect(renameSpy).toHaveBeenCalledWith(temporary, input.get());
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageCompressorSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/x/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageCompressorOutputPathStrategy = { strategy: "output_path", input, output };

    await adapter.compress(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");

    expect(renameSpy).toHaveBeenCalledWith("/x/out/photo-compressed.jpg", output.get());
  });
});
