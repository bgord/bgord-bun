import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageFormatterAdapter } from "../src/image-formatter.adapter";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";

const formatted = new TextEncoder().encode("formatted").buffer;

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileCleaner, FileRenamer, FileWriter };

const adapter = new ImageFormatterAdapter(deps);

const image = {
  rotate: () => image,
  webp: () => ({ bytes: () => formatted }),
  png: () => ({ bytes: () => formatted }),
  jpeg: () => ({ bytes: () => formatted }),
};

describe("ImageFormatterAdapter", () => {
  test("in_place - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const final = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-formatted.webp");
    const to = v.parse(tools.Extension, "webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    expect(await adapter.format(recipe)).toEqual(final);
    expect(write).toHaveBeenCalledWith(temporary.get(), formatted);
    expect(rename).toHaveBeenCalledWith(temporary, final);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using rename = spyOn(FileRenamer, "rename");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("var/img/photo.png");
    const final = tools.FilePathRelative.fromString("var/img/photo.png");
    const temporary = tools.FilePathRelative.fromString("var/img/photo-formatted.png");
    const to = v.parse(tools.Extension, "png");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    expect(await adapter.format(recipe)).toEqual(final);
    expect(rename).toHaveBeenCalledWith(temporary, final);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const output = tools.FilePathAbsolute.fromString("/var/img/result.webp");
    const temporary = tools.FilePathAbsolute.fromString("/var/img/result-formatted.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    expect(await adapter.format(recipe)).toEqual(output);
    expect(write).toHaveBeenCalledWith(temporary.get(), formatted);
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("var/img/photo.webp");
    const output = tools.FilePathRelative.fromString("var/img/result.jpg");
    const temporary = tools.FilePathRelative.fromString("var/img/result-formatted.jpg");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    expect(await adapter.format(recipe)).toEqual(output);
    expect(write).toHaveBeenCalledWith(temporary.get(), formatted);
    expect(rename).toHaveBeenCalledWith(temporary, output);
    expect(fileCleaner).not.toHaveBeenCalled();
  });
});
