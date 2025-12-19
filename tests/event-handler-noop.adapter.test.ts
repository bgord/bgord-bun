import { describe, expect, test } from "bun:test";
import { EventHandlerNoopAdapter } from "../src/event-handler-noop.adapter";
import * as mocks from "./mocks";

const event = { name: "user.created" };

const handler = new EventHandlerNoopAdapter();

describe("EventHandlerNoopAdapter", () => {
  test("happy path", async () => {
    const fn = async (_event: typeof event) => {};

    expect(async () => handler.handle(fn)(event)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(event)).not.toThrow();
  });
});
