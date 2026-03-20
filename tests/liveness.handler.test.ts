import { describe, expect, test } from "bun:test";
import { LivenessHandler } from "../src/liveness.handler";

describe("LivenessHandler", () => {
  test("happy path", () => {
    const handler = new LivenessHandler();

    expect(handler.execute()).toEqual({ ok: true });
  });
});
