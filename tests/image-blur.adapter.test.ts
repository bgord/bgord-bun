import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileRenamerNoopAdapter } from "../src/file-renamer-noop.adapter";
import { FileWriterNoopAdapter } from "../src/file-writer-noop.adapter";
import { ImageBlurAdapter } from "../src/image-blur.adapter";
import type { ImageBlurStrategy } from "../src/image-blur.port";

const base64 = "bW9jay1kYXRh";
const placeholder = `data:image/jpg;base64,${base64}`;
const buffer = Buffer.from(base64, "base64");

const FileRenamer = new FileRenamerNoopAdapter();
const FileWriter = new FileWriterNoopAdapter();
const deps = { FileRenamer, FileWriter };

const adapter = new ImageBlurAdapter(deps);

// TODO UNFIY
describe("ImageBlurAdapter", () => {
  test("in_place", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => ({ placeholder: () => placeholder }) });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const temporary = tools.FilePathAbsolute.fromString("/var/img/photo-blurred.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    expect(await adapter.blur(recipe)).toEqual(input);
    expect(write).toHaveBeenCalledWith(temporary.get(), buffer);
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => ({ placeholder: () => placeholder }) });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathAbsolute.fromString("/var/img/photo.jpg");
    const output = tools.FilePathAbsolute.fromString("/var/img/result.jpg");
    const temporary = tools.FilePathAbsolute.fromString("/var/img/result-blurred.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output };

    expect(await adapter.blur(recipe)).toEqual(output);
    expect(write).toHaveBeenCalledWith(temporary.get(), buffer);
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });

  test("in_place - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => ({ placeholder: () => placeholder }) });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("var/img/photo.jpg");
    const temporary = tools.FilePathRelative.fromString("var/img/photo-blurred.jpg");
    const recipe: ImageBlurStrategy = { strategy: "in_place", input };

    expect(await adapter.blur(recipe)).toEqual(input);
    expect(write).toHaveBeenCalledWith(temporary.get(), buffer);
    expect(rename).toHaveBeenCalledWith(temporary, input);
  });

  test("output_path - relative", async () => {
    // @ts-expect-error Partial access
    using _ = spyOn(Bun, "file").mockReturnValue({ image: () => ({ placeholder: () => placeholder }) });
    using write = spyOn(FileWriter, "write");
    using rename = spyOn(FileRenamer, "rename");

    const input = tools.FilePathRelative.fromString("var/img/photo.jpg");
    const output = tools.FilePathRelative.fromString("var/img/result.jpg");
    const temporary = tools.FilePathRelative.fromString("var/img/result-blurred.jpg");
    const recipe: ImageBlurStrategy = { strategy: "output_path", input, output };

    expect(await adapter.blur(recipe)).toEqual(output);
    expect(write).toHaveBeenCalledWith(temporary.get(), buffer);
    expect(rename).toHaveBeenCalledWith(temporary, output);
  });
});
