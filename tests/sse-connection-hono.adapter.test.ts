import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { SseConnectionHonoAdapter } from "../src/sse-connection-hono.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

const config = { keepalive: tools.Duration.Seconds(30) };

describe("SseConnectionHonoAdapter", () => {
  test("attach - register", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const adapter = new SseConnectionHonoAdapter<mocks.MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    await app.request("/sse");

    // @ts-expect-error Private property
    expect(registry.connections.get(mocks.userId)?.size).toEqual(1);
  });

  test("send", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const adapter = new SseConnectionHonoAdapter<mocks.MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    await registry.emit(mocks.userId, mocks.message);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toContain(`event: ${mocks.message.name}`);
    expect(text).toContain(`data: ${JSON.stringify(mocks.message)}`);
  });

  test("keepalive", async () => {
    jest.useFakeTimers();

    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const adapter = new SseConnectionHonoAdapter<mocks.MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    jest.advanceTimersByTime(config.keepalive.ms);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toEqualIgnoringWhitespace("event:ping data:");

    jest.useRealTimers();
  });
});
