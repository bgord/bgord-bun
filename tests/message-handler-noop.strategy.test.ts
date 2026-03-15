import { describe, expect, test } from "bun:test";
import { MessageHandlerNoopStrategy } from "../src/message-handler-noop.strategy";
import * as mocks from "./mocks";

const handler = new MessageHandlerNoopStrategy();

describe("MessageHandlerNoopStrategy", () => {
  test("happy path", async () => {
    const fn = async (_: mocks.MessageType) => {};

    expect(async () => handler.handle(fn)(mocks.message)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message)).not.toThrow();
  });
});
