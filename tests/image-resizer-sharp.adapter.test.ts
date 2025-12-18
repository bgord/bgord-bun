import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageResizerInPlaceStrategy, ImageResizerOutputPathStrategy } from "../src/image-resizer.port";
import { ImageResizerSharpAdapter } from "../src/image-resizer-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  resize: (_opts: any) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };
const adapter = new ImageResizerSharpAdapter(deps);

describe("ImageResizerSharpAdapter", () => {
  test("in_place", async () => {
    const sharp = spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const resize = spyOn(pipeline, "resize");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 512 };

    const result = await adapter.resize(recipe);

    // @ts-expect-error
    const [options] = resize.mock.calls[0];

    expect(resize).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({ width: 512, height: 512, fit: "inside", withoutEnlargement: true });

    // @ts-expect-error
    const [format] = toFormat.mock.calls[0];

    expect(toFormat).toHaveBeenCalledTimes(1);
    expect(format).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-resized.jpg");

    expect(toFile).toHaveBeenCalledTimes(1);
    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(result).toEqual(input);
    expect(sharp).toHaveBeenCalledWith("/var/img/photo.jpg");
    expect(rotate).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const resize = spyOn(pipeline, "resize").mockReturnValue(pipeline);
    const toFormat = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFile = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageResizerOutputPathStrategy = { strategy: "output_path", input, output, maxSide: 256 };

    const result = await adapter.resize(recipe);

    expect(result).toEqual(output);
    expect(resize.mock.calls?.[0]?.[0]).toMatchObject({
      width: 256,
      height: 256,
      fit: "inside",
      withoutEnlargement: true,
    });
    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("webp");

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-resized.webp");

    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("in_place - relative", async () => {
    spyOn(pipeline, "rotate").mockReturnValue(pipeline);
    spyOn(pipeline, "resize").mockReturnValue(pipeline);
    spyOn(pipeline, "destroy").mockReturnValue();
    spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat").mockReturnValue(pipeline);
    const toFile = spyOn(pipeline, "toFile").mockResolvedValue(undefined);
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageResizerInPlaceStrategy = { strategy: "in_place", input, maxSide: 128 };

    await adapter.resize(recipe);

    const [format] = toFormat.mock.calls[0];

    expect(format).toEqual("png");

    const temporary = tools.FilePathRelative.fromString("images/pic-resized.png");

    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - jpg to jpeg", async () => {
    spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/a/in.jpeg");
    const output = tools.FilePathAbsolute.fromString("/b/out/photo.jpg");
    const recipe: ImageResizerOutputPathStrategy = { strategy: "output_path", input, output, maxSide: 300 };

    await adapter.resize(recipe);

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/b/out/photo-resized.jpg");

    expect(rename).toHaveBeenCalledWith(temporary, output);
  });
});
