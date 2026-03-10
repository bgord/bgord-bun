import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { SseConnectionHonoAdapter } from "../src/sse-connection-hono.adapter";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;
const config = { keepalive: tools.Duration.Seconds(30) };
const callback = () => {};

describe("SseConnectionHonoAdapter", () => {
  test("attach - register", async () => {
    const registry = new SseRegistryAdapter<MessageType>();
    const adapter = new SseConnectionHonoAdapter<MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    await app.request("/sse");

    // @ts-expect-error Private property
    expect(registry.connections.get(mocks.userId)?.size).toEqual(1);
  });

  test("attach - unregister", async () => {
    const registry = new SseRegistryAdapter<MessageType>();
    const adapter = new SseConnectionHonoAdapter<MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    await app.request("/sse");
    adapter.close(callback);

    // @ts-expect-error Private property
    expect(registry.connections.get(mocks.userId)?.size).toEqual(0);
  });

  test("send", async () => {
    const registry = new SseRegistryAdapter<MessageType>();
    const adapter = new SseConnectionHonoAdapter<MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    await registry.emit(mocks.userId, message);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toContain(`event: ${message.name}`);
    expect(text).toContain(`data: ${JSON.stringify(message)}`);
  });

  test("close", async () => {
    const callback = jest.fn();
    const registry = new SseRegistryAdapter<MessageType>();
    const adapter = new SseConnectionHonoAdapter<MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    const response = await app.request("/sse");
    adapter.close(callback);

    const { done } = await response.body!.getReader().read();
    expect(done).toEqual(true);
    expect(callback).toHaveBeenCalled();
  });

  test("keepalive", async () => {
    jest.useFakeTimers();

    const registry = new SseRegistryAdapter<MessageType>();
    const adapter = new SseConnectionHonoAdapter<MessageType>(registry, mocks.userId, config);
    const app = new Hono().get("/sse", (c) => adapter.attach(c));

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    jest.advanceTimersByTime(config.keepalive.ms);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toContain("event: ping");
    expect(text).toContain("data: ");

    jest.useRealTimers();
  });
});
