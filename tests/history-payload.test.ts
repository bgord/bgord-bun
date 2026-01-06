import { describe, expect, test } from "bun:test";
import * as History from "../src/modules/history";

describe("HistoryPayloadParsed", () => {
  test("HistoryPayload", async () => {
    expect(() => History.VO.HistoryPayload.parse({})).not.toThrow();
    expect(() => History.VO.HistoryPayload.parse({ subject: "order" })).not.toThrow();
  });

  test("HistoryPayloadParsed", () => {
    const result = History.VO.HistoryPayloadParsed.safeParse({ subject: "order" });

    expect(result.success).toEqual(true);
    expect(result.data).toEqual('{"subject":"order"}');
  });

  test("HistoryPayloadParsed - -rejects circular references", () => {
    const circular: Record<string, any> = { name: "loop" };
    circular.self = circular;

    expect(() => History.VO.HistoryPayloadParsed.safeParse(circular)).toThrow(
      "history.payload.parsed.not.serializable",
    );
  });
});
