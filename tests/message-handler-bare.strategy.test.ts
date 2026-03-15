import { describe, expect, test } from "bun:test";
import { MessageHandlerBareStrategy } from "../src/message-handler-bare.strategy";
import * as mocks from "./mocks";

const handler = new MessageHandlerBareStrategy();

describe("MessageHandlerBareStrategy", () => {
  test("happy path", async () => {
    const fn = async (_: mocks.MessageType) => {};

    expect(async () => handler.handle(fn)(mocks.message)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message)).toThrow();
  });
});
