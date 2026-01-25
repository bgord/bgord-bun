import { describe, expect, test } from "bun:test";
import { CsvStringifierAdapter } from "../src/csv-stringifier.adapter";

describe("CsvStringifierAdapter", async () => {
  test("process", async () => {
    const columns = ["id", "name"];
    const data = [
      { id: 1, name: "Anne" },
      { id: 2, name: "Bart" },
    ];
    const strigifier = new CsvStringifierAdapter();

    expect(await strigifier.process(columns, data)).toEqualIgnoringWhitespace(`
      id, name
      1,Anne
      2, Bart`);
  });

  test("process - empty", async () => {
    const columns = [];
    const data = [];
    const strigifier = new CsvStringifierAdapter();

    expect(await strigifier.process(columns, data)).toEqualIgnoringWhitespace("");
  });
});
