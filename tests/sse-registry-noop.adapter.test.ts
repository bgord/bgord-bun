import { describe, expect, jest, test } from "bun:test";
import { SseRegistryNoopAdapter } from "../src/sse-registry-noop.adapter";
import * as mocks from "./mocks";

const registry = new SseRegistryNoopAdapter<mocks.MessageType>();
const sender = jest.fn();

describe("SseRegistryNoopAdapter", () => {
  test("register", async () => {
    expect(() => registry.register(mocks.userId, sender)).not.toThrow();
  });

  test("unregister", async () => {
    expect(() => registry.unregister(mocks.userId, sender)).not.toThrow();
  });

  test("emit", async () => {
    expect(async () => registry.emit(mocks.userId, mocks.message)).not.toThrow();
  });
});
