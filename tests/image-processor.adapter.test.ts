import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { ImageProcessorAdapter } from "../src/image-processor.adapter";
import type { ImageProcessorStrategy } from "../src/image-processor.port";

const processed = new TextEncoder().encode("processed").buffer;
const maxSide = v.parse(tools.ImageWidth, 512);

const FileCleaner = new FileCleanerNoopAdapter();
const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const deps = { AtomicFileWriter, FileCleaner };

const adapter = new ImageProcessorAdapter(deps);

const image = {
  rotate: () => image,
  resize: () => image,
  webp: () => ({ bytes: () => processed }),
  png: () => ({ bytes: () => processed }),
  jpeg: () => ({ bytes: () => processed }),
};

describe("ImageProcessorAdapter", () => {
  test("in_place - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using rotate = spyOn(image, "rotate");
    using resize = spyOn(image, "resize");
    using webp = spyOn(image, "webp");
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const final = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide,
      to: v.parse(tools.Extension, "webp"),
      quality: tools.Int.positive(72),
    };

    expect(await adapter.process(recipe)).toEqual(final);
    expect(rotate).toHaveBeenCalledWith(0);
    expect(resize).toHaveBeenCalledWith(maxSide, maxSide, { fit: "inside", withoutEnlargement: true });
    expect(webp).toHaveBeenCalledWith({ quality: 72 });
    expect(write).toHaveBeenCalledWith(final, processed);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("var/img/image.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide,
      to: v.parse(tools.Extension, "png"),
    };

    expect(await adapter.process(recipe)).toEqual(input);
    expect(write).toHaveBeenCalledWith(input, processed);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using jpeg = spyOn(image, "jpeg");
    using write = spyOn(AtomicFileWriter, "write");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const output = tools.FilePathAbsolute.fromString("/var/img/result.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide,
      to: v.parse(tools.Extension, "jpg"),
    };

    expect(await adapter.process(recipe)).toEqual(output);
    expect(jpeg).toHaveBeenCalledWith({ quality: 85 });
    expect(write).toHaveBeenCalledWith(output, processed);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using jpeg = spyOn(image, "jpeg");
    using write = spyOn(AtomicFileWriter, "write");

    const input = tools.FilePathRelative.fromString("var/img/photo.png");
    const output = tools.FilePathRelative.fromString("var/img/result.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide,
      to: v.parse(tools.Extension, "jpg"),
    };

    expect(await adapter.process(recipe)).toEqual(output);
    expect(jpeg).toHaveBeenCalledWith({ quality: 85 });
    expect(write).toHaveBeenCalledWith(output, processed);
  });
});
