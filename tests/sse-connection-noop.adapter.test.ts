import { describe, expect, test } from "bun:test";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;

const connection = new SseConnectionNoopAdapter<MessageType>();
const callback = () => {};

describe("SseConnectionNoopAdapter", async () => {
  test("send", async () => {
    expect(async () => connection.send(message)).not.toThrow();
  });

  test("close", async () => {
    expect(async () => connection.close(callback)).not.toThrow();
  });
});
