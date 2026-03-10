import { describe, expect, test } from "bun:test";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import { SseRegistryNoopAdapter } from "../src/sse-registry-noop.adapter";
import * as mocks from "./mocks";

const registry = new SseRegistryNoopAdapter<mocks.MessageType>();
const connection = new SseConnectionNoopAdapter<mocks.MessageType>();

describe("SseRegistryNoopAdapter", () => {
  test("register", async () => {
    expect(() => registry.register(mocks.userId, connection)).not.toThrow();
  });

  test("unregister", async () => {
    expect(() => registry.unregister(mocks.userId, connection)).not.toThrow();
  });

  test("emit", async () => {
    expect(async () => registry.emit(mocks.userId, mocks.message)).not.toThrow();
  });
});
