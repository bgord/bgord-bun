import { describe, expect, spyOn, test } from "bun:test";
import { CsvStringifierAdapter } from "../src/csv-stringifier.adapter";
import * as mocks from "./mocks";

describe("CsvStringifierAdapter", async () => {
  test("process", async () => {
    const columns = ["id", "name"];
    const data = [
      { id: 1, name: "Anne" },
      { id: 2, name: "Bart" },
    ];
    const strigifier = await CsvStringifierAdapter.build();

    expect(await strigifier.process(columns, data)).toEqualIgnoringWhitespace(`
      id, name
      1,Anne
      2, Bart`);
  });

  test("process - empty", async () => {
    const columns = [] as string[];
    const data = [] as Record<string, any>[];
    const strigifier = await CsvStringifierAdapter.build();

    expect(await strigifier.process(columns, data)).toEqualIgnoringWhitespace("");
  });

  test("missing dependency", async () => {
    spyOn(CsvStringifierAdapter, "import").mockImplementation(mocks.throwIntentionalErrorAsync);

    expect(async () => CsvStringifierAdapter.build()).toThrow(
      "csv.stringifier.adapter.error.missing.dependency",
    );
  });
});
