import { describe, expect, jest, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { AuthSessionReaderNoopAdapter } from "../src/auth-session-reader-noop.adapter";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { ShieldAuthHonoStrategy } from "../src/shield-auth-hono.strategy";
import { SseHonoHandler } from "../src/sse-hono.handler";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver([new SubjectSegmentUserStrategy()], deps);
const config = { keepalive: tools.Duration.Seconds(30) };

describe("SseHonoHandler", async () => {
  const context = new RequestContextBuilder().withUserId(mocks.userId).build();
  const subject = await resolver.resolve(context);

  test("register", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: mocks.user, session: mocks.session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseHonoHandler<mocks.MessageType>(config, { registry, HashContent });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    await app.request("/sse");

    // @ts-expect-error Private property
    expect(registry.senders.get(subject.hex.get())?.size).toEqual(1);
  });

  test("send", async () => {
    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: mocks.user, session: mocks.session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseHonoHandler<mocks.MessageType>(config, { registry, HashContent });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    await registry.emit(subject.hex.get(), mocks.message);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    expect(text).toEqualIgnoringWhitespace(
      `event: ${mocks.message.name} data: ${JSON.stringify(mocks.message)}`,
    );
  });

  test("keepalive", async () => {
    jest.useFakeTimers();

    const registry = new SseRegistryAdapter<mocks.MessageType>();
    const AuthSessionReader = new AuthSessionReaderNoopAdapter({ user: mocks.user, session: mocks.session });
    const ShieldAuth = new ShieldAuthHonoStrategy({ AuthSessionReader });
    const handler = new SseHonoHandler<mocks.MessageType>(config, { registry, HashContent });
    const app = new Hono().use(ShieldAuth.attach).get("/sse", ShieldAuth.verify, ...handler.handle());

    const response = await app.request("/sse");
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    jest.advanceTimersByTime(config.keepalive.ms);

    const { value } = await reader.read();
    const text = decoder.decode(value);

    jest.useRealTimers();

    expect(text).toEqualIgnoringWhitespace(`event: ping data: ${JSON.stringify({ keepalive: true })}`);
  });
});
