import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageResizerAdapter } from "../src/image-resizer.adapter";
import type { ImageResizerInPlaceStrategy, ImageResizerOutputPathStrategy } from "../src/image-resizer.port";
import * as testcase from "./testcases";

const resized = new TextEncoder().encode("resized").buffer;
const maxSide = v.parse(tools.ImageWidth, 512);

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileRenamer, FileWriter };

const adapter = new ImageResizerAdapter(deps);

describe("ImageResizerAdapter", () => {
  test("in_place - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ resize: () => ({ jpeg: () => ({ bytes: () => resized }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageResizerInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
      maxSide,
    };

    expect(await adapter.resize(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(write).toHaveBeenCalledWith(testcase.images.in_place.absolute.temporary("resized").get(), resized);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("resized"),
      testcase.images.in_place.absolute.input,
    );
  });

  test("in_place - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ resize: () => ({ png: () => ({ bytes: () => resized }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageResizerInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
      maxSide,
    };

    expect(await adapter.resize(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(write).toHaveBeenCalledWith(testcase.images.in_place.relative.temporary("resized").get(), resized);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("resized"),
      testcase.images.in_place.relative.input,
    );
  });

  test("output_path - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ resize: () => ({ webp: () => ({ bytes: () => resized }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageResizerOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
      maxSide,
    };

    expect(await adapter.resize(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("resized").get(),
      resized,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("resized"),
      testcase.images.output_path.absolute.output,
    );
  });

  test("output_path - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ resize: () => ({ png: () => ({ bytes: () => resized }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageResizerOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.relative.input,
      output: testcase.images.output_path.relative.output,
      maxSide,
    };

    expect(await adapter.resize(recipe)).toEqual(testcase.images.output_path.relative.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.relative.temporary("resized").get(),
      resized,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.relative.temporary("resized"),
      testcase.images.output_path.relative.output,
    );
  });

  test("jpg_to_jpeg", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ resize: () => ({ jpeg: () => ({ bytes: () => resized }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageResizerInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
      maxSide,
    };

    expect(await adapter.resize(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.temporary("resized").get(), resized);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.jpg_to_jpeg.temporary("resized"),
      testcase.images.jpg_to_jpeg.input,
    );
  });
});
