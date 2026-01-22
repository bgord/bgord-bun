import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { FileInspectionAdapter } from "../src/file-inspection.adapter";

const adapter = new FileInspectionAdapter();

describe("FileInspectionAdapter", () => {
  test("exists - true - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });
    const path = "package.json";

    expect(await adapter.exists(path)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("exist - true - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.exists(path)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("exist - true - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => true });
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.exists(path)).toEqual(true);
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });

  test("exists - false - string", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });
    const path = "package.json";

    expect(await adapter.exists(path)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("package.json");
  });

  test("exist - false - relative", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });
    const path = tools.FilePathRelative.fromString("users/package.json");

    expect(await adapter.exists(path)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("users/package.json");
  });

  test("exist - false - absolute", async () => {
    // @ts-expect-error Partial access
    const bunFile = spyOn(Bun, "file").mockReturnValue({ exists: () => false });
    const path = tools.FilePathAbsolute.fromString("/users/package.json");

    expect(await adapter.exists(path)).toEqual(false);
    expect(bunFile).toHaveBeenCalledWith("/users/package.json");
  });
});
