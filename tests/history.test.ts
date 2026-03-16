import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import * as History from "../src/modules/history";
import * as mocks from "./mocks";

describe("History", () => {
  test("happy path", () => {
    const payload = {
      id: mocks.correlationId,
      operation: "read",
      payload: {},
      subject: "order",
      createdAt: mocks.TIME_ZERO.ms,
    };
    expect(v.safeParse(History.VO.History, payload).success).toEqual(true);
    expect(v.safeParse(History.VO.History, payload).output).toEqual(payload);
  });
});
