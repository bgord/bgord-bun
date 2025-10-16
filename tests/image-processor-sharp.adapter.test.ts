import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageProcessorStrategy } from "../src/image-processor.port";
import { ImageProcessorSharpAdapter } from "../src/image-processor-sharp.adapter";

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileCleaner, FileRenamer };

const adapter = new ImageProcessorSharpAdapter(deps);

const pipeline = {
  rotate: () => pipeline,
  flatten: (_: any) => pipeline,
  resize: (_: any) => pipeline,
  toFormat: (_fmt: any, _opts?: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

describe("ImageProcessorSharpAdapter", () => {
  test("in_place", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rotateSpy = spyOn(pipeline, "rotate");
    const flattenSpy = spyOn(pipeline, "flatten");
    const resizeSpy = spyOn(pipeline, "resize");
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/in/photo.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide: 256,
      to: tools.Extension.parse("webp"),
      quality: 72,
      background: "#FFFFFF",
    };

    const result = await adapter.process(recipe);

    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).toHaveBeenCalledWith({ background: "#FFFFFF" });

    const [options] = resizeSpy.mock.calls[0];
    expect(resizeSpy).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({ width: 256, height: 256, fit: "inside", withoutEnlargement: true });

    const [format, opts] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("webp");
    expect(opts).toMatchObject({ quality: 72 });

    const temporary = tools.FilePathAbsolute.fromString("/var/in/photo-processed.webp");
    const formatted = tools.FilePathAbsolute.fromString("/var/in/photo.webp");

    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, formatted);

    expect(fileCleanerSpy).toHaveBeenCalledWith(input.get());

    expect(result.get()).toEqual(formatted.get());

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const rotateSpy = spyOn(pipeline, "rotate");
    const flattenSpy = spyOn(pipeline, "flatten");
    const resizeSpy = spyOn(pipeline, "resize");
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/in/source.png");
    const output = tools.FilePathAbsolute.fromString("/out/dest.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide: 512,
      to: tools.Extension.parse("jpg"),
    };

    const result = await adapter.process(recipe);

    expect(rotateSpy).toHaveBeenCalledTimes(1);
    expect(flattenSpy).not.toHaveBeenCalled();

    const [options] = resizeSpy.mock.calls[0];
    expect(options).toMatchObject({ width: 512, height: 512, fit: "inside", withoutEnlargement: true });

    const [format, opts] = toFormatSpy.mock.calls[0];
    expect(format).toEqual("jpeg");
    expect(opts).toMatchObject({ quality: 85 });

    const temporary = tools.FilePathAbsolute.fromString("/out/dest-processed.jpg");
    expect(toFileSpy.mock.calls[0][0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, output);

    expect(fileCleanerSpy).not.toHaveBeenCalled();

    expect(result).toEqual(output);

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
