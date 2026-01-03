import { describe, expect, test } from "bun:test";
import * as History from "../src/modules/history";

describe("HistoryPayloadParsed", () => {
  test("HistoryPayload", async () => {
    expect(() => History.VO.HistoryPayload.parse({})).not.toThrow();
    expect(() => History.VO.HistoryPayload.parse({ subject: "order" })).not.toThrow();
  });

  test("happy path", () => {
    const result = History.VO.HistoryPayloadParsed.safeParse({ subject: "order" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('{"subject":"order"}');
    }
  });

  test("rejects circular references (Kills Mutants)", () => {
    const circular: Record<string, any> = { name: "loop" };
    circular.self = circular;

    expect(() => History.VO.HistoryPayloadParsed.safeParse(circular)).toThrow(
      "history.payload.parsed.not.serializable",
    );
  });
});
