import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as _sharp from "sharp";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageProcessorStrategy } from "../src/image-processor.port";
import { ImageProcessorSharpAdapter } from "../src/image-processor-sharp.adapter";

const pipeline = {
  rotate: () => pipeline,
  flatten: (_: any) => pipeline,
  resize: (_: any) => pipeline,
  toFormat: (_fmt: any, _opts?: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileCleaner, FileRenamer };

const adapter = new ImageProcessorSharpAdapter(deps);

describe("ImageProcessorSharpAdapter", () => {
  test("in_place", async () => {
    const sharp = spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const flatten = spyOn(pipeline, "flatten");
    const resize = spyOn(pipeline, "resize");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");
    const input = tools.FilePathAbsolute.fromString("/var/in/photo.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide: tools.ImageWidth.parse(256),
      to: tools.Extension.parse("webp"),
      quality: tools.IntegerPositive.parse(72),
      background: "#FFFFFF",
    };

    const result = await adapter.process(recipe);

    expect(rotate).toHaveBeenCalledTimes(1);
    expect(flatten).toHaveBeenCalledWith({ background: "#FFFFFF" });

    // @ts-expect-error
    const [options] = resize.mock.calls[0];

    expect(resize).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({ width: 256, height: 256, fit: "inside", withoutEnlargement: true });

    // @ts-expect-error
    const [format, opts] = toFormat.mock.calls[0];

    expect(format).toEqual("webp");
    expect(opts).toMatchObject({ quality: 72 });

    const temporary = tools.FilePathAbsolute.fromString("/var/in/photo-processed.webp");
    const formatted = tools.FilePathAbsolute.fromString("/var/in/photo.webp");

    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, formatted);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
    expect(result.get()).toEqual(formatted.get());
    expect(sharp).toHaveBeenCalledWith(input.get());
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("in_place - same extension", async () => {
    spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    spyOn(pipeline, "rotate");
    spyOn(pipeline, "toFormat");
    spyOn(pipeline, "toFile");
    spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/in/image.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide: tools.ImageWidth.parse(100),
      to: tools.Extension.parse("png"),
    };

    const result = await adapter.process(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/in/image-processed.png");

    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(fileCleaner).not.toHaveBeenCalled();
    expect(result.get()).toEqual(input.get());
  });

  test("output_path", async () => {
    const sharp = spyOn(_sharp as any, "default").mockImplementation(() => pipeline);
    const rotate = spyOn(pipeline, "rotate");
    const flatten = spyOn(pipeline, "flatten");
    const resize = spyOn(pipeline, "resize");
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");
    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: tools.ImageWidth.parse(512),
      to: tools.Extension.parse("jpg"),
    };

    const result = await adapter.process(recipe);

    expect(rotate).toHaveBeenCalledTimes(1);
    expect(flatten).not.toHaveBeenCalled();

    const [options] = resize.mock.calls[0];

    expect(options).toMatchObject({ width: 512, height: 512, fit: "inside", withoutEnlargement: true });

    const [format, opts] = toFormat.mock.calls[0];

    expect(format).toEqual("jpeg");
    expect(opts).toMatchObject({ quality: 85 });

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-processed.jpg");

    expect(toFile.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(fileCleaner).not.toHaveBeenCalled();
    expect(result).toEqual(output);
    expect(sharp).toHaveBeenCalledWith(input.get());
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
