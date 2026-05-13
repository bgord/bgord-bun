import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageCompressorAdapter } from "../src/image-compressor.adapter";
import type {
  ImageCompressorInPlaceStrategy,
  ImageCompressorOutputPathStrategy,
} from "../src/image-compressor.port";
import * as testcase from "./testcases";

const compressed = new TextEncoder().encode("compressed").buffer;

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileRenamer, FileWriter };

const adapter = new ImageCompressorAdapter(deps);

describe("ImageCompressorAdapter", () => {
  test("in_place - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ jpeg: () => ({ bytes: () => compressed }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageCompressorInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.absolute.input,
    };

    expect(await adapter.compress(recipe)).toEqual(testcase.images.in_place.absolute.input);
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("compressed").get(),
      compressed,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.absolute.temporary("compressed"),
      testcase.images.in_place.absolute.input,
    );
  });

  test("in_place - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ png: () => ({ bytes: () => compressed }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageCompressorInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.in_place.relative.input,
    };

    expect(await adapter.compress(recipe)).toEqual(testcase.images.in_place.relative.input);
    expect(write).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("compressed").get(),
      compressed,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.in_place.relative.temporary("compressed"),
      testcase.images.in_place.relative.input,
    );
  });

  test("output_path - absolute", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ webp: () => ({ bytes: () => compressed }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageCompressorOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.absolute.input,
      output: testcase.images.output_path.absolute.output,
      quality: tools.Int.positive(73),
    };

    expect(await adapter.compress(recipe)).toEqual(testcase.images.output_path.absolute.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("compressed").get(),
      compressed,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.absolute.temporary("compressed"),
      testcase.images.output_path.absolute.output,
    );
  });

  test("output_path - relative", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ png: () => ({ bytes: () => compressed }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageCompressorOutputPathStrategy = {
      strategy: "output_path",
      input: testcase.images.output_path.relative.input,
      output: testcase.images.output_path.relative.output,
    };

    expect(await adapter.compress(recipe)).toEqual(testcase.images.output_path.relative.output);
    expect(write).toHaveBeenCalledWith(
      testcase.images.output_path.relative.temporary("compressed").get(),
      compressed,
    );
    expect(rename).toHaveBeenCalledWith(
      testcase.images.output_path.relative.temporary("compressed"),
      testcase.images.output_path.relative.output,
    );
  });

  test("jpg_to_jpeg", async () => {
    using _ = spyOn(Bun, "file").mockReturnValue({
      // @ts-expect-error Partial access
      image: () => ({ rotate: () => ({ jpeg: () => ({ bytes: () => compressed }) }) }),
    });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const recipe: ImageCompressorInPlaceStrategy = {
      strategy: "in_place",
      input: testcase.images.jpg_to_jpeg.input,
    };

    expect(await adapter.compress(recipe)).toEqual(testcase.images.jpg_to_jpeg.input);
    expect(write).toHaveBeenCalledWith(testcase.images.jpg_to_jpeg.temporary("compressed").get(), compressed);
    expect(rename).toHaveBeenCalledWith(
      testcase.images.jpg_to_jpeg.temporary("compressed"),
      testcase.images.jpg_to_jpeg.input,
    );
  });
});
