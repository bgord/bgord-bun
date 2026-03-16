import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import * as History from "../src/modules/history";

describe("HistoryOperation", () => {
  test("happy path", () => {
    expect(v.safeParse(History.VO.HistoryOperation, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(History.VO.HistoryOperation, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(History.VO.HistoryOperation, null)).toThrow("history.operation.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(History.VO.HistoryOperation, 123)).toThrow("history.operation.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(History.VO.HistoryOperation, "")).toThrow("history.operation.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(History.VO.HistoryOperation, `${"a".repeat(128)}a`)).toThrow(
      "history.operation.too.long",
    );
  });
});
