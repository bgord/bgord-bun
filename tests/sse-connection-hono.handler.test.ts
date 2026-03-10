import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { AuthSessionReaderNoopAdapter } from "../src/auth-session-reader-noop.adapter";
import { ShieldAuthHonoStrategy } from "../src/shield-auth-hono.strategy";
import { SseConnectionHonoHandler } from "../src/sse-connection-hono.handler";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import * as mocks from "./mocks";

const keepalive = tools.Duration.Seconds(30);

describe("SseConnectionHonoHandler", () => {
  test("register", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: mocks.user, session: mocks.session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseConnectionHonoHandler<mocks.MessageType>(registry, { keepalive });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    await app.request("/sse");

    // @ts-expect-error Private property
    expect(registry.connections.get(mocks.user.id)?.size).toEqual(1);
  });

  test("send", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: mocks.user, session: mocks.session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseConnectionHonoHandler<mocks.MessageType>(registry, { keepalive });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    await registry.emit(mocks.user.id, mocks.message);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toEqualIgnoringWhitespace(
      `event: ${mocks.message.name} data: ${JSON.stringify(mocks.message)}`,
    );
  });
});
