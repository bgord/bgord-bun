import { describe, expect, test } from "bun:test";
import { SseConnectionNoopAdapter } from "../src/sse-connection-noop.adapter";
import * as mocks from "./mocks";

const connection = new SseConnectionNoopAdapter<mocks.MessageType>();
const callback = () => {};

describe("SseConnectionNoopAdapter", async () => {
  test("send", async () => {
    expect(async () => connection.send(mocks.message)).not.toThrow();
  });

  test("close", async () => {
    expect(async () => connection.close(callback)).not.toThrow();
  });
});
