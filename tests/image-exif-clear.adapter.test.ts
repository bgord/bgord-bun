// cspell:ignore Exif

import { describe, expect, spyOn, test } from "bun:test";
import { AtomicFileWriterNoopAdapter } from "../src/atomic-file-writer-noop.adapter";
import { ImageExifClearAdapter } from "../src/image-exif-clear.adapter";
import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
} from "../src/image-exif-clear.port";
import * as testcase from "./testcases";

const cleared = new TextEncoder().encode("cleared").buffer;

const AtomicFileWriter = new AtomicFileWriterNoopAdapter();
const deps = { AtomicFileWriter };

const adapter = new ImageExifClearAdapter(deps);

const image = {
  rotate: () => image,
  jpeg: () => ({ bytes: () => cleared }),
  png: () => ({ bytes: () => cleared }),
  webp: () => ({ bytes: () => cleared }),
};

describe("ImageExifClearAdapter", () => {
  test("in_place - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageExifClearInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(write).toHaveBeenCalledWith(testcase.images.in_place.absolute.input, cleared);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageExifClearInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(write).toHaveBeenCalledWith(testcase.images.in_place.relative.input, cleared);
  });

  test("output_path - absolute", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageExifClearOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(write).toHaveBeenCalledWith(testcase.images.output_path.absolute.output, cleared);
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageExifClearOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.relative.input,
      output: testcase.images.output_path.relative.output,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.output_path.relative.output);
    expect(write).toHaveBeenCalledWith(testcase.images.output_path.relative.output, cleared);
  });

  test("jpg_to_jpeg", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => image });
    using write = spyOn(AtomicFileWriter, "write");

    const recipe: ImageExifClearInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.input, cleared);
  });
});
