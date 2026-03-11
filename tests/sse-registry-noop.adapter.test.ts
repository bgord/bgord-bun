import { describe, expect, jest, test } from "bun:test";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SseRegistryNoopAdapter } from "../src/sse-registry-noop.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver([new SubjectSegmentUserStrategy()], deps);
const registry = new SseRegistryNoopAdapter<mocks.MessageType>();
const sender = jest.fn();

describe("SseRegistryNoopAdapter", async () => {
  const context = new RequestContextBuilder().withUserId(mocks.userId).build();
  const subject = await resolver.resolve(context);

  test("register", async () => {
    expect(() => registry.register(subject.hex.get(), sender)).not.toThrow();
  });

  test("unregister", async () => {
    expect(() => registry.unregister(subject.hex.get(), sender)).not.toThrow();
  });

  test("emit", async () => {
    expect(async () => registry.emit(subject.hex.get(), mocks.message)).not.toThrow();
  });
});
