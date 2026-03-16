import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import * as History from "../src/modules/history";

describe("HistoryPayloadParsed", () => {
  test("HistoryPayload", () => {
    expect(() => v.parse(History.VO.HistoryPayload, {})).not.toThrow();
    expect(() => v.parse(History.VO.HistoryPayload, { subject: "order" })).not.toThrow();
  });

  test("HistoryPayloadParsed", () => {
    const result = v.safeParse(History.VO.HistoryPayloadParsed, { subject: "order" });
    expect(result.success).toEqual(true);
    expect(result.output).toEqual('{"subject":"order"}');
  });

  test("HistoryPayloadParsed - rejects circular references", () => {
    const circular: Record<string, any> = { name: "loop" };
    circular.self = circular;
    expect(() => v.parse(History.VO.HistoryPayloadParsed, circular)).toThrow(
      "history.payload.parsed.not.serializable",
    );
  });
});
