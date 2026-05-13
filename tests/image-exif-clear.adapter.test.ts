import { describe, expect, spyOn, test } from "bun:test";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageExifClearAdapter } from "../src/image-exif-clear.adapter";
import type {
  ImageExifClearInPlaceStrategy,
  ImageExifClearOutputPathStrategy,
} from "../src/image-exif-clear.port";
import * as testcase from "./testcases";

const cleared = new TextEncoder().encode("cleared").buffer;

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileRenamer, FileWriter };

const adapter = new ImageExifClearAdapter(deps);

describe("ImageExifClearAdapter", () => {
  test("in_place - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ jpeg: () => ({ bytes: () => cleared }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageExifClearInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("exif-cleared").get(),
      cleared,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("exif-cleared"),
      testcase.images.in_place.absolute.input,
    );
  });

  test("in_place - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ png: () => ({ bytes: () => cleared }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageExifClearInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("exif-cleared").get(),
      cleared,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("exif-cleared"),
      testcase.images.in_place.relative.input,
    );
  });

  test("output_path - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ webp: () => ({ bytes: () => cleared }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageExifClearOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("exif-cleared").get(),
      cleared,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("exif-cleared"),
      testcase.images.output_path.absolute.output,
    );
  });

  test("output_path - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ png: () => ({ bytes: () => cleared }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageExifClearOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.relative.input,
      output: testcase.images.output_path.relative.output,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.output_path.relative.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.relative.temporary("exif-cleared").get(),
      cleared,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.relative.temporary("exif-cleared"),
      testcase.images.output_path.relative.output,
    );
  });

  test("jpg_to_jpeg", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ jpeg: () => ({ bytes: () => cleared }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageExifClearInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.clear(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.temporary("exif-cleared").get(), cleared);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.jpg_to_jpeg.temporary("exif-cleared"),
      testcase.images.jpg_to_jpeg.input,
    );
  });
});
