import { describe, expect, spyOn, test } from "bun:test";
import { FileWriterForgivingAdapter } from "../src/file-writer-forgiving.adapter";
import * as mocks from "./mocks";
import * as testcases from "./testcases";

const FileWriter = new FileWriterForgivingAdapter();

describe("FileWriterForgivingAdapter", () => {
  test("happy path - string", async () => {
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const content = "data";

    expect(async () => FileWriter.write(testcases.file.input.string, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(testcases.file.input.string, content);
  });

  test("happy path - relative", async () => {
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const content = new Uint8Array([1, 2, 3]);

    expect(async () => FileWriter.write(testcases.file.input.relative, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(testcases.file.input.relative.get(), content);
  });

  test("happy path - absolute", async () => {
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const content = new ArrayBuffer(4);

    expect(async () => FileWriter.write(testcases.file.input.absolute, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(testcases.file.input.absolute.get(), content);
  });

  test("swallows an error", () => {
    using _ = spyOn(Bun, "write").mockImplementation(mocks.throwIntentionalError);
    const content = "data";

    expect(async () => FileWriter.write(testcases.file.input.string, content)).not.toThrow();
  });
});
