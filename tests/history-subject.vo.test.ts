import { describe, expect, test } from "bun:test";
import * as History from "../src/modules/history";

describe("History.VO.HistorySubject", () => {
  test("happy path", () => {
    expect(History.VO.HistorySubject.safeParse("a".repeat(128)).success).toEqual(true);
    expect(History.VO.HistorySubject.safeParse("A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => History.VO.HistorySubject.parse(null)).toThrow("history.subject.type");
  });

  test("rejects non-string - number", () => {
    expect(() => History.VO.HistorySubject.parse(123)).toThrow("history.subject.type");
  });

  test("rejects empty", () => {
    expect(() => History.VO.HistorySubject.parse("")).toThrow("history.subject.empty");
  });

  test("rejects too long", () => {
    expect(() => History.VO.HistorySubject.parse(`${"a".repeat(128)}a`)).toThrow("history.subject.too.long");
  });
});
