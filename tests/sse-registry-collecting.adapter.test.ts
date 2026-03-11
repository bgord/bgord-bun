import { describe, expect, jest, test } from "bun:test";
import { SseRegistryCollectingAdapter } from "../src/sse-registry-collecting.adapter";
import * as mocks from "./mocks";

const registry = new SseRegistryCollectingAdapter<mocks.MessageType>();
const sender = jest.fn();

describe("SseRegistryCollectingAdapter", () => {
  test("register", async () => {
    expect(() => registry.register(mocks.userId, sender)).not.toThrow();
  });

  test("unregister", async () => {
    expect(() => registry.unregister(mocks.userId, sender)).not.toThrow();
  });

  test("emit", async () => {
    await registry.emit(mocks.userId, mocks.message);

    expect(registry.emitted).toEqual([{ userId: mocks.userId, message: mocks.message }]);
  });
});
