import { describe, expect, test } from "bun:test";
import * as History from "../src/modules/history";
import * as mocks from "./mocks";

describe("History.VO.History", () => {
  test("happy path", () => {
    const payload = {
      id: mocks.correlationId,
      operation: "read",
      payload: {},
      subject: "order",
      createdAt: mocks.TIME_ZERO.ms,
    };

    expect(History.VO.History.safeParse(payload).success).toEqual(true);
    expect(History.VO.History.safeParse(payload).data).toEqual(payload);
  });
});
