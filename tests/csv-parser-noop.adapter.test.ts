// cspell:ignore Stringifier
import { describe, expect, test } from "bun:test";
import { CsvParserNoopAdapter } from "../src/csv-parser-noop.adapter";

const result = [{ abc: "def" }];
const adapter = new CsvParserNoopAdapter(result);

describe("CsvParserNoopAdapter", () => {
  test("process", async () => {
    expect(await adapter.process("id,content")).toEqual(result);
  });
});
