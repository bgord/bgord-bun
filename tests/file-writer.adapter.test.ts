import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileWriterAdapter } from "../src/file-writer.adapter";
import * as mocks from "./mocks";

const FileWriter = new FileWriterAdapter();

describe("FileWriterAdapter", () => {
  test("happy path - string", async () => {
    const path = "package.json";
    const content = "data";
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(async () => FileWriter.write(path, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(path, content);
  });

  test("happy path - relative", async () => {
    const path = tools.FilePathRelative.fromString("users/package.json");
    const content = new Uint8Array([1, 2, 3]);
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(async () => FileWriter.write(path, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(path.get(), content);
  });

  test("happy path - absolute", async () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    const content = new ArrayBuffer(4);
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);

    expect(async () => FileWriter.write(path, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(path.get(), content);
  });

  test("throw an error", () => {
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    const content = "data";
    using _ = spyOn(Bun, "write").mockImplementation(mocks.throwIntentionalError);

    expect(async () => FileWriter.write(path, content)).toThrow();
  });
});
