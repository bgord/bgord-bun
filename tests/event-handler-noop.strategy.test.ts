import { describe, expect, test } from "bun:test";
import { EventHandlerNoopStrategy } from "../src/event-handler-noop.strategy";
import * as mocks from "./mocks";

const handler = new EventHandlerNoopStrategy();

describe("EventHandlerNoopStrategy", () => {
  test("happy path", async () => {
    const fn = async (_event: mocks.MessageType) => {};

    expect(async () => handler.handle(fn)(mocks.message)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message)).not.toThrow();
  });
});
