import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileWriterAdapter } from "../src/file-writer.adapter";
import * as mocks from "./mocks";

const FileWriter = new FileWriterAdapter();

describe("FileWriterAdapter", () => {
  test("happy path - string", async () => {
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const path = "package.json";
    const content = "data";

    expect(async () => FileWriter.write(path, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(path, content);
  });

  test("happy path - relative", async () => {
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const path = tools.FilePathRelative.fromString("users/package.json");
    const content = new Uint8Array([1, 2, 3]);

    expect(async () => FileWriter.write(path, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(path.get(), content);
  });

  test("happy path - absolute", async () => {
    using bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    const content = new ArrayBuffer(4);

    expect(async () => FileWriter.write(path, content)).not.toThrow();
    expect(bunWrite).toHaveBeenCalledWith(path.get(), content);
  });

  test("throw an error", () => {
    using _ = spyOn(Bun, "write").mockImplementation(mocks.throwIntentionalError);
    const path = tools.FilePathAbsolute.fromString("/users/package.json");
    const content = "data";

    expect(async () => FileWriter.write(path, content)).toThrow();
  });
});
