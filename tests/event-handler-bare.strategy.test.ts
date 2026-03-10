import { describe, expect, test } from "bun:test";
import { EventHandlerBareStrategy } from "../src/event-handler-bare.strategy";
import * as mocks from "./mocks";

const handler = new EventHandlerBareStrategy();

describe("EventHandlerBareStrategy", () => {
  test("happy path", async () => {
    const fn = async (_event: mocks.MessageType) => {};

    expect(async () => handler.handle(fn)(mocks.message)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(mocks.message)).toThrow();
  });
});
