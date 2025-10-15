import { describe, expect, spyOn, test } from "bun:test";
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurSharpAdapter } from "../src/image-blur-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  blur: (_?: number) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageBlurSharpAdapter", () => {
  test("in_place", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const blurSpy = spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    const output = await adapter.blur(recipe);

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(blurSpy).toHaveBeenCalledWith(undefined);
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");
    expect(toFormatSpy).toHaveBeenCalledTimes(1);

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/var/img/photo-blurred.jpg");

    expect(renameSpy).toHaveBeenCalledWith("/var/img/photo-blurred.jpg", input.get());

    expect(output).toEqual(input);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const blurSpy = spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 2.5 };

    const result = await adapter.blur(recipe);

    expect(blurSpy).toHaveBeenCalledWith(2.5);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("webp");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("/out/dest-blurred.webp");

    expect(renameSpy).toHaveBeenCalledWith("/out/dest-blurred.webp", output.get());

    expect(result).toEqual(output);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relateive", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input, sigma: 1 };

    await adapter.blur(recipe);

    const [format] = toFormatSpy.mock.calls[0] as any[];
    expect(format).toEqual("png");

    const temporary = toFileSpy.mock.calls[0][0];
    expect(temporary).toEqual("images/pic-blurred.png");

    expect(renameSpy).toHaveBeenCalledWith("images/pic-blurred.png", input.get());
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(fs, "rename").mockResolvedValue(undefined);

    const adapter = new ImageBlurSharpAdapter();

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 0.7 };

    await adapter.blur(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");

    expect(renameSpy).toHaveBeenCalledWith("/x/out/photo-blurred.jpg", output.get());
  });
});
