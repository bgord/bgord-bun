import { describe, expect, spyOn, test } from "bun:test";
import { DynamicImport } from "../src/dynamic-import.service";
import * as mocks from "./mocks";

describe("DynamicImport", () => {
  test("resolve - default export", async () => {
    type TestModule = { default: { version: string } };
    const importer = DynamicImport.for<TestModule>("bun:test", mocks.IntentionalError);

    const module = await importer.resolve();

    expect(module).toBeDefined();
    expect(module.default).toBeDefined();
  });

  test("resolve - named export", async () => {
    type TestModule = typeof import("bun:test");
    const importer = DynamicImport.for<TestModule>("bun:test", mocks.IntentionalError);

    const module = await importer.resolve();

    expect(module).toBeDefined();
    expect(module.describe).toBeDefined();
    expect(module.test).toBeDefined();
    expect(module.expect).toBeDefined();
  });

  test("resolve - failure", async () => {
    const importer = DynamicImport.for("non-existent-package-xyz-123", mocks.IntentionalError);

    // @ts-expect-error Private method
    using _ = spyOn(importer, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => importer.resolve()).toThrow(mocks.IntentionalError);
  });

  test("obfuscate", () => {
    const importer = DynamicImport.for("sharp", mocks.IntentionalError);

    // @ts-expect-error Private method
    expect(importer.obfuscate("sharp")).toEqual("sharp");
  });
});
