import { describe, expect, test } from "bun:test";
import { text } from "node:stream/consumers";
import { CsvStringifierAdapter } from "../src/csv-stringifier.adapter";

describe("CsvStringifierAdapter", async () => {
  test("happy path", async () => {
    const columns = ["id", "name"];
    const data = [
      { id: 1, name: "Anne" },
      { id: 2, name: "Bart" },
    ];

    const strigifier = new CsvStringifierAdapter();

    expect(await text(strigifier.process(columns, data))).toEqualIgnoringWhitespace(`
      id, name
      1,Anne
      2, Bart`);
  });
});
