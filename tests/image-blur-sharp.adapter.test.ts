import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurSharpAdapter } from "../src/image-blur-sharp.adapter";

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

const pipeline = {
  rotate: () => pipeline,
  blur: (_?: number) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const adapter = new ImageBlurSharpAdapter(deps);

describe("ImageBlurSharpAdapter", () => {
  test("in_place", async () => {
    const rotateSpy = spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const blurSpy = spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    const result = await adapter.blur(recipe);

    expect(result).toEqual(input);

    expect(blurSpy).toHaveBeenCalledTimes(1);
    expect(blurSpy).toHaveBeenCalledWith(undefined);
    expect(rotateSpy).toHaveBeenCalledTimes(1);

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-blurred.jpg");
    expect(toFormatSpy.mock.calls[0][0]).toEqual("jpeg");
    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());

    expect(renameSpy).toHaveBeenCalledWith(temporary, input);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const blurSpy = spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 2.5 };

    const result = await adapter.blur(recipe);

    expect(result).toEqual(output);

    expect(blurSpy).toHaveBeenCalledWith(2.5);
    expect(toFormatSpy.mock.calls[0][0]).toEqual("webp");

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-blurred.webp");
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());

    expect(renameSpy).toHaveBeenCalledWith(temporary, output);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("in_place - relateive", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "blur").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const destroySpy = spyOn(pipeline, "destroy").mockReturnValue();

    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input, sigma: 1 };

    const result = await adapter.blur(recipe);
    expect(result.get()).toEqual(input.get());

    const temporary = tools.FilePathRelative.fromString("images/pic-blurred.png");
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());
    expect(toFormatSpy.mock.calls[0][0]).toEqual("png");

    expect(renameSpy).toHaveBeenCalledWith(temporary, input);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 0.7 };

    await adapter.blur(recipe);

    const blurred = tools.FilePathAbsolute.fromString("/x/out/photo-blurred.jpg");

    expect(toFormatSpy.mock.calls[0][0]).toEqual("jpeg");
    expect(renameSpy).toHaveBeenCalledWith(blurred, output);
  });
});
