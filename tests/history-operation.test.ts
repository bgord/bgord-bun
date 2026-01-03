import { describe, expect, test } from "bun:test";
import * as History from "../src/modules/history";

describe("History.VO.HistoryOperation", () => {
  test("happy path", () => {
    expect(History.VO.HistoryOperation.safeParse("a".repeat(128)).success).toEqual(true);
    expect(History.VO.HistoryOperation.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => History.VO.HistoryOperation.parse(null)).toThrow("history.operation.type");
  });

  test("rejects non-string - number", () => {
    expect(() => History.VO.HistoryOperation.parse(123)).toThrow("history.operation.type");
  });

  test("rejects empty", () => {
    expect(() => History.VO.HistoryOperation.parse("")).toThrow("history.operation.empty");
  });

  test("rejects too long", () => {
    expect(() => History.VO.HistoryOperation.parse(`${"a".repeat(128)}a`)).toThrow(
      "history.operation.too.long",
    );
  });
});
