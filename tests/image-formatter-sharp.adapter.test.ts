import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as sharpModule from "sharp";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";
import { ImageFormatterSharpAdapter } from "../src/image-formatter-sharp.adapter";

const pipeline = {
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileCleaner, FileRenamer };

const adapter = new ImageFormatterSharpAdapter(deps);

describe("ImageFormatterSharpAdapter", () => {
  test("in_place", async () => {
    const sharpSpy = spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const destroySpy = spyOn(pipeline, "destroy");
    const renameSpy = spyOn(FileRenamer, "rename");
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
    const to = tools.Extension.parse("webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    const result = await adapter.format(recipe);

    const formatted = tools.FilePathAbsolute.fromString("/var/in/img.webp");
    expect(result.get()).toEqual(formatted.get());

    const temporary = tools.FilePathAbsolute.fromString("/var/in/img-formatted.webp");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("webp");

    expect(renameSpy).toHaveBeenCalledWith(temporary, formatted);

    expect(fileCleanerSpy).toHaveBeenCalledWith(input.get());

    expect(sharpSpy).toHaveBeenCalledWith(input.get());
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("output_path", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const toFileSpy = spyOn(pipeline, "toFile");
    const renameSpy = spyOn(FileRenamer, "rename");
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/in/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    const result = await adapter.format(recipe);

    const temporary = tools.FilePathAbsolute.fromString("/var/out/dest-formatted.webp");
    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("webp");

    expect(renameSpy).toHaveBeenCalledWith(temporary, output);
    expect(fileCleanerSpy).not.toHaveBeenCalled();

    expect(result.get()).toEqual(output.get());
  });

  test("output_path - jpeg to jpg", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFormatSpy = spyOn(pipeline, "toFormat");
    const renameSpy = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/img/in.webp");
    const output = tools.FilePathAbsolute.fromString("/img/out/photo.jpg");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    await adapter.format(recipe);

    expect(toFormatSpy.mock.calls?.[0]?.[0]).toEqual("jpeg");

    expect(renameSpy).toHaveBeenCalledWith(
      tools.FilePathAbsolute.fromString("/img/out/photo-formatted.jpg"),
      output,
    );
  });

  test("in_place - relative", async () => {
    spyOn(sharpModule as any, "default").mockImplementation(() => pipeline);
    const toFileSpy = spyOn(pipeline, "toFile");
    const renameSpy = spyOn(FileRenamer, "rename");
    const fileCleanerSpy = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("images/pic.png");
    const to = tools.Extension.parse("jpeg");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    await adapter.format(recipe);

    const temporary = tools.FilePathRelative.fromString("images/pic-formatted.jpeg");
    const formatted = tools.FilePathRelative.fromString("images/pic.jpeg");

    expect(toFileSpy.mock.calls?.[0]?.[0]).toEqual(temporary.get());
    expect(renameSpy).toHaveBeenCalledWith(temporary, formatted);

    expect(fileCleanerSpy).toHaveBeenCalledWith(input.get());
  });
});
