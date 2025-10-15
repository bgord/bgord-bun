import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";
import { ImageFormatterSharpAdapter } from "../src/image-formatter-sharp.adapter";

const pipeline = {
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const adapter = new ImageFormatterSharpAdapter();

describe("ImageFormatterSharpAdapter", () => {
  test("in_place", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
    const to = tools.Extension.parse("webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    const result = await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("webp");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/in/img-formatted.webp");
    expect(renameSpy).toHaveBeenCalledWith(temporary, "/var/in/img.webp");

    expect(unlinkSpy).toHaveBeenCalledWith(input.get());

    expect(result.get()).toEqual("/var/in/img.webp");

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const input = tools.FilePathAbsolute.fromString("/var/in/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    const result = await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("webp");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/out/dest-formatted.webp");
    expect(renameSpy).toHaveBeenCalledWith(temporary, output.get());

    expect(unlinkSpy).not.toHaveBeenCalled();

    expect(result.get()).toEqual(output.get());
  });

  test("output_path - jpeg to jpg", async () => {
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const input = tools.FilePathAbsolute.fromString("/img/in.webp");
    const output = tools.FilePathAbsolute.fromString("/img/out/photo.jpg");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    await adapter.format(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");

    const temporary = "/img/out/photo-formatted.jpg";
    expect(renameSpy).toHaveBeenCalledWith(temporary, output.get());
  });

  test("in_place - relative", async () => {
    spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);
    const unlinkSpy = spyOn(fs, "unlink").mockResolvedValue(undefined);

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const to = tools.Extension.parse("jpeg");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    await adapter.format(recipe);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("images/pic-formatted.jpeg");
    expect(renameSpy).toHaveBeenCalledWith(temporary, "images/pic.jpeg");

    expect(unlinkSpy).toHaveBeenCalledWith(input.get());
  });
});
