import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { ImageFormatterAdapter } from "../src/image-formatter.adapter";
import type { ImageFormatterStrategy } from "../src/image-formatter.port";

const formatted = new TextEncoder().encode("formatted").buffer;

const FileCleaner = new FileCleanerNoopAdapter();
const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const deps = { AtomicFileWriter, FileCleaner };

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
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const final = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
    const to = v.parse(tools.Extension, "webp");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    expect(await adapter.format(recipe)).toEqual(final);
    expect(write).toHaveBeenCalledWith(final, formatted);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("var/img/photo.png");
    const final = tools.FilePathRelative.fromString("var/img/photo.png");
    const to = v.parse(tools.Extension, "png");
    const recipe: ImageFormatterStrategy = { strategy: "in_place", input, to };

    expect(await adapter.format(recipe)).toEqual(final);
    expect(write).toHaveBeenCalledWith(final, formatted);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const output = tools.FilePathAbsolute.fromString("/var/img/result.webp");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    expect(await adapter.format(recipe)).toEqual(output);
    expect(write).toHaveBeenCalledWith(output, formatted);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("var/img/photo.webp");
    const output = tools.FilePathRelative.fromString("var/img/result.jpg");
    const recipe: ImageFormatterStrategy = { strategy: "output_path", input, output };

    expect(await adapter.format(recipe)).toEqual(output);
    expect(write).toHaveBeenCalledWith(output, formatted);
    expect(fileCleaner).not.toHaveBeenCalled();
  });
});
