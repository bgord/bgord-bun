import { describe, expect, test } from "bun:test";
import { CsvStringifierNoopAdapter } from "../src/csv-stringifier-noop.adapter";

const adapter = new CsvStringifierNoopAdapter();

describe("CsvStringifierNoopAdapter", () => {
  test("process", async () => {
    const columns = ["id", "name"];
    const data = [{ id: 1, name: "Anne" }];

    expect(await adapter.process(columns, data)).toEqual("");
  });

  test("process - empty", async () => {
    expect(await adapter.process([], [])).toEqual("");
  });
});
