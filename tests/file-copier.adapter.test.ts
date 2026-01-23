import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileCopierAdapter } from "../src/file-copier.adapter";
import * as mocks from "./mocks";

const content = "abc";

const FileCopier = new FileCopierAdapter();

describe("FileCopierAdapter", () => {
  test("happy path - string", async () => {
    // @ts-expect-error Partial access
    spyOn(Bun, "file").mockReturnValue(content);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const input = "package.json";
    const output = "package.json.gz";

    await FileCopier.copy(input, output);

    expect(bunWrite).toHaveBeenCalledWith("package.json.gz", content);
  });

  test("happy path - relative", async () => {
    // @ts-expect-error Partial access
    spyOn(Bun, "file").mockReturnValue(content);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const input = tools.FilePathRelative.fromString("users/package.json");
    const output = tools.FilePathRelative.fromString("users/package.json.gz");

    await FileCopier.copy(input, output);

    expect(bunWrite).toHaveBeenCalledWith("users/package.json.gz", content);
  });

  test("happy path - absolute", async () => {
    // @ts-expect-error Partial access
    spyOn(Bun, "file").mockReturnValue(content);
    const bunWrite = spyOn(Bun, "write").mockResolvedValue(0);
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package.json.gz");

    await FileCopier.copy(input, output);

    expect(bunWrite).toHaveBeenCalledWith("/users/package.json.gz", content);
  });

  test("throw an error", () => {
    spyOn(Bun, "file").mockImplementation(mocks.throwIntentionalError);
    const input = tools.FilePathAbsolute.fromString("/users/package.json");
    const output = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(async () => FileCopier.copy(input, output)).toThrow();
  });
});
