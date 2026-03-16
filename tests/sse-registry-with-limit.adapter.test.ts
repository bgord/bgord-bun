import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { SseRegistryAdapter } from "../src/sse-registry.adapter";
import { SseRegistryWithLimitAdapter } from "../src/sse-registry-with-limit.adapter";
import { SubjectRequestResolver } from "../src/subject-request-resolver.vo";
import { SubjectSegmentUserStrategy } from "../src/subject-segment-user.strategy";
import * as mocks from "./mocks";
import { RequestContextBuilder } from "./request-context-builder";

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

const resolver = new SubjectRequestResolver([new SubjectSegmentUserStrategy()], deps);

const limit = v.parse(tools.IntegerPositive, 2);

describe("SseRegistryWithLimitAdapter", async () => {
  const context = new RequestContextBuilder().withUserId(mocks.userId).build();
  const subject = await resolver.resolve(context);

  test("register", async () => {
    const inner = new SseRegistryAdapter<mocks.MessageType>();
    const registry = new SseRegistryWithLimitAdapter<mocks.MessageType>({ inner, limit });
    using register = spyOn(inner, "register");

    registry.register(subject.hex.get(), jest.fn());
    registry.register(subject.hex.get(), jest.fn());
    registry.register(subject.hex.get(), jest.fn());

    expect(register).toHaveBeenCalledTimes(2);
  });

  test("unregister", async () => {
    const sender = jest.fn();
    const inner = new SseRegistryAdapter<mocks.MessageType>();
    const registry = new SseRegistryWithLimitAdapter<mocks.MessageType>({ inner, limit });
    using unregister = spyOn(inner, "unregister");

    registry.unregister(subject.hex.get(), sender);

    expect(unregister).toHaveBeenCalledWith(subject.hex.get(), sender);
  });

  test("emit", async () => {
    const inner = new SseRegistryAdapter<mocks.MessageType>();
    const registry = new SseRegistryWithLimitAdapter<mocks.MessageType>({ inner, limit });
    using emit = spyOn(inner, "emit");

    await registry.emit(subject.hex.get(), mocks.message);

    expect(emit).toHaveBeenCalledWith(subject.hex.get(), mocks.message);
  });

  test("count", async () => {
    const sender = jest.fn();
    const inner = new SseRegistryAdapter<mocks.MessageType>();
    const registry = new SseRegistryWithLimitAdapter<mocks.MessageType>({ inner, limit });

    registry.register(subject.hex.get(), sender);

    expect(registry.count(subject.hex.get())).toEqual(1);

    registry.unregister(subject.hex.get(), sender);

    expect(registry.count(subject.hex.get())).toEqual(0);
  });
});
