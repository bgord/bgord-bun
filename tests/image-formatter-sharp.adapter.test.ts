import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";
import { ImageFormatterSharpAdapter } from "../src/image-formatter-sharp.adapter";
import * as mocks from "./mocks";

const pipeline = {
  toFormat: (_format: any) => pipeline,
  toFile: async (_: string) => {},
  destroy: () => {},
};

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const deps = { FileCleaner, FileRenamer };

describe("ImageFormatterSharpAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageFormatterSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const destroy = spyOn(pipeline, "destroy");
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");
    const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
    const to = tools.Extension.parse("webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };
    const adapter = await ImageFormatterSharpAdapter.build(deps);

    const result = await adapter.format(recipe);
    const formatted = tools.FilePathAbsolute.fromString("/var/in/img.webp");
    const temporary = tools.FilePathAbsolute.fromString("/var/in/img-formatted.webp");

    expect(result.get()).toEqual(formatted.get());
    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(toFormat).toHaveBeenCalledWith("webp");
    expect(rename).toHaveBeenCalledWith(temporary, formatted);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("in_place - same extension", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageFormatterSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");
    const input = tools.FilePathAbsolute.fromString("/var/in/img.png");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to: tools.Extension.parse("png") };
    const adapter = await ImageFormatterSharpAdapter.build(deps);

    const result = await adapter.format(recipe);
    const temporary = tools.FilePathAbsolute.fromString("/var/in/img-formatted.png");

    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(fileCleaner).not.toHaveBeenCalled();
    expect(result.get()).toEqual(input.get());
  });

  test("output_path", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageFormatterSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    const toFormat = spyOn(pipeline, "toFormat");
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");
    const input = tools.FilePathAbsolute.fromString("/var/in/source.jpeg");
    const output = tools.FilePathAbsolute.fromString("/var/out/dest.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };
    const adapter = await ImageFormatterSharpAdapter.build(deps);

    const result = await adapter.format(recipe);

    const temporary = tools.FilePathAbsolute.fromString("/var/out/dest-formatted.webp");

    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(toFormat).toHaveBeenCalledWith("webp");
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(fileCleaner).not.toHaveBeenCalled();
    expect(result.get()).toEqual(output.get());
  });

  test("output_path - jpeg to jpg", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageFormatterSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    const toFormat = spyOn(pipeline, "toFormat");
    const rename = spyOn(FileRenamer, "rename");
    const input = tools.FilePathAbsolute.fromString("/img/in.webp");
    const output = tools.FilePathAbsolute.fromString("/img/out/photo.jpg");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };
    const adapter = await ImageFormatterSharpAdapter.build(deps);

    await adapter.format(recipe);

    expect(toFormat).toHaveBeenCalledWith("jpeg");
    expect(rename).toHaveBeenCalledWith(
      tools.FilePathAbsolute.fromString("/img/out/photo-formatted.jpg"),
      output,
    );
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(ImageFormatterSharpAdapter, "import").mockResolvedValue({ default: () => pipeline });
    const toFile = spyOn(pipeline, "toFile");
    const rename = spyOn(FileRenamer, "rename");
    const fileCleaner = spyOn(FileCleaner, "delete");
    const input = tools.FilePathRelative.fromString("images/pic.png");
    const to = tools.Extension.parse("jpeg");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };
    const adapter = await ImageFormatterSharpAdapter.build(deps);

    await adapter.format(recipe);

    const temporary = tools.FilePathRelative.fromString("images/pic-formatted.jpeg");
    const formatted = tools.FilePathRelative.fromString("images/pic.jpeg");

    expect(toFile).toHaveBeenCalledWith(temporary.get());
    expect(rename).toHaveBeenCalledWith(temporary, formatted);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
  });

  test("missing dependency", async () => {
    spyOn(ImageFormatterSharpAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => ImageFormatterSharpAdapter.build(deps)).toThrow(
      "image.formatter.sharp.adapter.error.missing.dependency",
    );
  });
});
