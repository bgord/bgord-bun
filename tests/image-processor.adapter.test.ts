import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileCleanerNoopAdapter } from "../src/file-cleaner-noop.adapter";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageProcessorAdapter } from "../src/image-processor.adapter";
import type { ImageProcessorStrategy } from "../src/image-processor.port";

const processed = new TextEncoder().encode("processed").buffer;
const maxSide = v.parse(tools.ImageWidth, 512);

const FileCleaner = new FileCleanerNoopAdapter();
const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileCleaner, FileRenamer, FileWriter };

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
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const final = tools.FilePathAbsolute.fromString("/var/img/photo.webp");
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-processed.webp");
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
    expect(write).toHaveBeenCalledWith(temporary.get(), processed);
    expect(rename).toHaveBeenCalledWith(temporary, final);
    expect(fileCleaner).toHaveBeenCalledWith(input.get());
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using rename = spyOn(FileRenamer, "rename");
    using fileCleaner = spyOn(FileCleaner, "delete");

    const input = tools.FilePathRelative.fromString("var/img/image.png");
    const temporary = tools.FilePathRelative.fromString("var/img/image-processed.png");
    const recipe: ImageProcessorStrategy = {
      strategy: "in_place",
      input,
      maxSide,
      to: v.parse(tools.Extension, "png"),
    };

    expect(await adapter.process(recipe)).toEqual(input);
    expect(rename).toHaveBeenCalledWith(temporary, input);
    expect(fileCleaner).not.toHaveBeenCalled();
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using jpeg = spyOn(image, "jpeg");
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.png");
    const output = tools.FilePathAbsolute.fromString("/var/img/result.jpg");
    const temporary = tools.FilePathAbsolute.fromString("/var/img/result-processed.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide,
      to: v.parse(tools.Extension, "jpg"),
    };

    expect(await adapter.process(recipe)).toEqual(output);
    expect(jpeg).toHaveBeenCalledWith({ quality: 85 });
    expect(write).toHaveBeenCalledWith(temporary.get(), processed);
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using jpeg = spyOn(image, "jpeg");
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("var/img/photo.png");
    const output = tools.FilePathRelative.fromString("var/img/result.jpg");
    const temporary = tools.FilePathRelative.fromString("var/img/result-processed.jpg");
    const recipe: ImageProcessorStrategy = {
      strategy: "output_path",
      input,
      output,
      maxSide,
      to: v.parse(tools.Extension, "jpg"),
    };

    expect(await adapter.process(recipe)).toEqual(output);
    expect(jpeg).toHaveBeenCalledWith({ quality: 85 });
    expect(write).toHaveBeenCalledWith(temporary.get(), processed);
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });
});
