import { describe, expect, test } from "bun:test";
import { PingHandler } from "../src/ping.handler";

describe("PingHandler", () => {
  test("happy path", () => {
    const handler = new PingHandler();

    expect(handler.execute()).toEqual("pong");
  });
});
