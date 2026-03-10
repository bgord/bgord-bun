import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { AuthSessionReaderNoopAdapter } from "../src/auth-session-reader-noop.adapter";
import { ShieldAuthHonoStrategy } from "../src/shield-auth-hono.strategy";
import { SseConnectionHonoHandler } from "../src/sse-connection-hono.handler";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

type MessageType = { name: "TEST_MESSAGE" };
const message = { name: "TEST_MESSAGE" } as const;
const keepalive = tools.Duration.Seconds(30);

const user = mocks.user;
const session = { id: "session-123" };

describe("SseConnectionHonoHandler", () => {
  test("register", async () => {
    const registry = new SseRegistryAdapter<MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseConnectionHonoHandler<MessageType>(registry, { keepalive });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    await app.request("/sse");

    // @ts-expect-error Private property
    expect(registry.connections.get(mocks.user.id)?.size).toEqual(1);
  });

  test("send", async () => {
    const registry = new SseRegistryAdapter<MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user, session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseConnectionHonoHandler<MessageType>(registry, { keepalive });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    await registry.emit(mocks.user.id, message);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toContain(`event: ${message.name}`);
    expect(text).toContain(`data: ${JSON.stringify(message)}`);
  });
});
