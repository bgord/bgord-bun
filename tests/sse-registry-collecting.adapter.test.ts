import { describe, expect, test } from "bun:test";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import { SseRegistryCollectingAdapter } from "../src/sse-registry-collecting.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

const registry = new SseRegistryCollectingAdapter<MessageType>();
const connection = new SseConnectionNoopAdapter<MessageType>();

describe("SseRegistryCollectingAdapter", () => {
  test("register", async () => {
    expect(() => registry.register(mocks.userId, connection)).not.toThrow();
  });

  test("unregister", async () => {
    expect(() => registry.unregister(mocks.userId, connection)).not.toThrow();
  });

  test("emit", async () => {
    await registry.emit(mocks.userId, message);

    expect(registry.emitted).toEqual([{ userId: mocks.userId, message }]);
  });
});
