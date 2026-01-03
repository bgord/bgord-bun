import { describe, expect, test } from "bun:test";
import * as History from "../src/modules/history";

describe("HistoryPayloadParsed", () => {
  test("HistoryPayload", async () => {
    expect(() => History.VO.HistoryPayload.parse({})).not.toThrow();
    expect(() => History.VO.HistoryPayload.parse({ subject: "order" })).not.toThrow();
  });

  test("HistoryPayloadParsed", async () => {
    expect(() => History.VO.HistoryPayloadParsed.parse({})).not.toThrow();
    expect(() => History.VO.HistoryPayloadParsed.parse({ subject: "order" })).not.toThrow();
    expect(() => History.VO.HistoryPayloadParsed.parse(null)).toThrow();
  });
});
