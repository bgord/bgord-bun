import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import * as History from "../src/modules/history";

describe("HistorySubject", () => {
  test("happy path", () => {
    expect(v.safeParse(History.VO.HistorySubject, "a".repeat(128)).success).toEqual(true);
    expect(v.safeParse(History.VO.HistorySubject, "A".repeat(128)).success).toEqual(true);
  });

  test("rejects non-string - null", () => {
    expect(() => v.parse(History.VO.HistorySubject, null)).toThrow("history.subject.type");
  });

  test("rejects non-string - number", () => {
    expect(() => v.parse(History.VO.HistorySubject, 123)).toThrow("history.subject.type");
  });

  test("rejects empty", () => {
    expect(() => v.parse(History.VO.HistorySubject, "")).toThrow("history.subject.empty");
  });

  test("rejects too long", () => {
    expect(() => v.parse(History.VO.HistorySubject, `${"a".repeat(128)}a`)).toThrow(
      "history.subject.too.long",
    );
  });
});
