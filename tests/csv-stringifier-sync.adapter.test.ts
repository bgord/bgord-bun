import { describe, expect, test } from "bun:test";
import { CsvStringifierSyncAdapter } from "../src/csv-stringifier-sync.adapter";

describe("CsvStringifierSyncAdapter", () => {
  test("works", async () => {
    const columns = ["id", "name"];
    const data = [
      { id: 1, name: "Anne" },
      { id: 2, name: "Bart" },
    ];

    const strigifier = new CsvStringifierSyncAdapter();

    expect(strigifier.process(columns, data)).toEqualIgnoringWhitespace(`
      id, name
      1,Anne
      2, Bart`);
  });
});
