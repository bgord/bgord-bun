import { describe, expect, spyOn, test } from "bun:test";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageGrayscaleAdapter } from "../src/image-grayscale.adapter";
import type {
  ImageGrayscaleInPlaceStrategy,
  ImageGrayscaleOutputPathStrategy,
} from "../src/image-grayscale.port";
import * as testcase from "./testcases";

const grayscaled = new TextEncoder().encode("grayscale").buffer;

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileRenamer, FileWriter };

const adapter = new ImageGrayscaleAdapter(deps);

describe("ImageGrayscaleAdapter", () => {
  test("in_place - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ modulate: () => ({ jpeg: () => ({ bytes: () => grayscaled }) }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("grayscale").get(),
      grayscaled,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("grayscale"),
      testcase.images.in_place.absolute.input,
    );
  });

  test("in_place - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ modulate: () => ({ png: () => ({ bytes: () => grayscaled }) }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("grayscale").get(),
      grayscaled,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("grayscale"),
      testcase.images.in_place.relative.input,
    );
  });

  test("output_path - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ modulate: () => ({ webp: () => ({ bytes: () => grayscaled }) }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("grayscale").get(),
      grayscaled,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("grayscale"),
      testcase.images.output_path.absolute.output,
    );
  });

  test("jpg_to_jpeg", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ modulate: () => ({ jpeg: () => ({ bytes: () => grayscaled }) }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageGrayscaleInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.grayscale(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.temporary("grayscale").get(), grayscaled);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.jpg_to_jpeg.temporary("grayscale"),
      testcase.images.jpg_to_jpeg.input,
    );
  });
});
