import { describe, expect, test } from "bun:test";
import { EventHandlerBareAdapter } from "../src/event-handler-bare.adapter";
import * as mocks from "./mocks";

const event = { name: "user.created" };

const handler = new EventHandlerBareAdapter();

describe("EventHandlerBareAdapter", () => {
  test("happy path", async () => {
    const fn = async (_event: typeof event) => {};

    expect(async () => handler.handle(fn)(event)).not.toThrow();
  });

  test("failure", async () => {
    expect(async () => handler.handle(mocks.throwIntentionalErrorAsync)(event)).toThrow();
  });
});
