import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageBlurStrategy } from "../src/image-blur.port";
import { ImageBlurSharpAdapter } from "../src/image-blur-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  blur: (_?: number) => pipeline,
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileRenamer };
const adapter = new ImageBlurSharpAdapter(deps);

describe("ImageBlurSharpAdapter", () => {
  test("in_place", async () => {
    const sharp = spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const blur = spyOn(pipeline, "blur");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    const result = await adapter.blur(recipe);

    expect(result).toEqual(input);
    expect(blur).toHaveBeenCalledTimes(1);
    expect(blur).toHaveBeenCalledWith(undefined);
    expect(rotate).toHaveBeenCalledTimes(1);

    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-blurred.jpg");

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("jpeg");
    expect(toFormat).toHaveBeenCalledTimes(1);
    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(sharp).toHaveBeenCalledWith(input.get());
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    const sharp = spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const blur = spyOn(pipeline, "blur");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.webp");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 2.5 };

    const result = await adapter.blur(recipe);

    expect(result).toEqual(output);
    expect(blur).toHaveBeenCalledWith(2.5);
    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("webp");

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-blurred.webp");

    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(sharp).toHaveBeenCalledWith(input.get());
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("in_place - relateive", async () => {
    spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input, sigma: 1 };

    const result = await adapter.blur(recipe);

    expect(result.get()).toEqual(input.get());

    const temporary = tools.FilePathRelative.fromString("images/pic-blurred.png");

    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("png");
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/x/in.webp");
    const output = tools.FilePathAbsolute.fromString("/x/out/photo.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output, sigma: 0.7 };

    await adapter.blur(recipe);

    expect(toFormat.mock.calls?.[0]?.[0]).toEqual("jpeg");

    const temporary = tools.FilePathAbsolute.fromString("/x/out/photo-blurred.jpg");

    expect(rename).toHaveBeenCalledWith(temporary, output);
  });
});
