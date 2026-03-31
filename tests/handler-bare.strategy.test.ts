import { describe, expect, test } from "bun:test";
import { HandlerBareStrategy } from "../src/handler-bare.strategy";
import * as mocks from "./mocks";

const handler = new HandlerBareStrategy();

describe("HandlerBareStrategy", () => {
  test("happy path", async () => {
    const fn = async (_: mocks.MessageType) => {};

    expect(async () => handler.handle(fn)(mocks.message)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message)).toThrow();
  });
});
