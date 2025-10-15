import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageResizerInPlaceStrategy, ImageResizerOutputPathStrategy } from "../src/image-resizer.port";
import { ImageResizerSharpAdapter } from "../src/image-resizer-sharp.adapter";

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };

const pipeline = {
  rotate: () => pipeline,
  resize: (_opts: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const adapter = new ImageResizerSharpAdapter(deps);

describe("ImageResizerSharpAdapter", () => {
  test("in_place", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rotateSpy = spyOn(pipeline, "rotate");
    const resizeSpy = spyOn(pipeline, "resize");
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 512 };

    const result = await adapter.resize(recipe);

    const [options] = resizeSpy.mock.calls[0];
    expect(resizeSpy).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({ width: 512, height: 512, fit: "inside", withoutEnlargement: true });

    const [format] = toFormatSpy.mock.calls[0];
    expect(toFormatSpy).toHaveBeenCalledTimes(1);
    expect(format).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-resized.jpg");
    expect(toFileSpy).toHaveBeenCalledTimes(1);
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, input);

    expect(result).toEqual(input);

    expect(sharpSpy).toHaveBeenCalledWith("/var/img/photo.jpg");
    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    const resizeSpy = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageResizerOutputPathStrategy = { strategy: "output_path", input, output, maxSide: 256 };

    const result = await adapter.resize(recipe);

    expect(result).toEqual(output);

    expect(resizeSpy.mock.calls[0][0]).toMatchObject({
      width: 256,
      height: 256,
      fit: "inside",
      withoutEnlargement: true,
    });

    expect(toFormatSpy.mock.calls[0][0]).toEqual("webp");

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-resized.webp");
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);
  });

  test("in_place - relative", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFileSpy = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 128 };

    await adapter.resize(recipe);

    const [format] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("png");

    const temporary = tools.FilePathRelative.fromString("images/pic-resized.png");
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpg to jpeg", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/a/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/b/out/photo.jpg");
    const recipe: ImageResizerOutputPathStrategy = { strategy: "output_path", input, output, maxSide: 300 };

    await adapter.resize(recipe);

    expect(toFormatSpy.mock.calls[0][0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/b/out/photo-resized.jpg");
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);
  });
});
