import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { BuildInfo, type BuildInfoType } from "../src/build-info.vo";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommitSha } from "../src/commit-sha.vo";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { EventEnvelopeSchema, event } from "../src/event-envelope";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { ReactiveConfigNoopAdapter } from "../src/reactive-config-noop.adapter";
import * as mocks from "./mocks";

const stream = "stream";
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const BuildInfoConfig = new ReactiveConfigNoopAdapter<BuildInfoType>(BuildInfo, {
  timestamp: tools.Timestamp.fromNumber(1767775662000).ms,
  version: v.parse(tools.PackageVersionSchema, "v1.0.0"),
  sha: CommitSha.fromString("a".repeat(40)).value,
  size: tools.Size.fromBytes(0).toBytes(),
});

describe("EventEnvelope", () => {
  test("schema", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));

    const result = v.safeParse(v.object(EventEnvelopeSchema), {
      createdAt: Clock.now().ms,
      id: IdProvider.generate(),
      correlationId: IdProvider.generate(),
      stream,
      version: 1,
      commit: mocks.SHA.value,
      revision: undefined,
    });

    expect(result.success).toEqual(true);
  });

  test("event - no correlation id", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    const Event = v.object({
      ...EventEnvelopeSchema,
      name: v.literal("EVENT"),
      payload: v.object({ timestamp: tools.TimestampValue }),
    });

    expect(async () =>
      event(Event, stream, { timestamp: mocks.TIME_ZERO.ms }, { Clock, IdProvider, BuildInfoConfig }),
    ).toThrow("correlation.storage.missing");
  });

  test("event", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const Event = v.object({
        ...EventEnvelopeSchema,
        name: v.literal("EVENT"),
        payload: v.object({ timestamp: tools.TimestampValue }),
      });

      expect(
        await event(Event, stream, { timestamp: mocks.TIME_ZERO.ms }, { Clock, IdProvider, BuildInfoConfig }),
      ).toEqual({
        correlationId: mocks.correlationId,
        id: mocks.correlationId,
        createdAt: mocks.TIME_ZERO.ms,
        name: "EVENT",
        stream: "stream",
        version: 1,
        commit: mocks.SHA.value,
        payload: { timestamp: mocks.TIME_ZERO.ms },
      });
    });
  });

  test("event - v2", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, async () => {
      const EventV2 = v.object({
        ...EventEnvelopeSchema,
        version: v.literal(2),
        name: v.literal("EVENT"),
        payload: v.object({ timestamp: tools.TimestampValue, source: v.string() }),
      });

      expect(
        await event(
          EventV2,
          stream,
          { timestamp: mocks.TIME_ZERO.ms, source: "system" },
          { Clock, IdProvider, BuildInfoConfig },
        ),
      ).toEqual({
        correlationId: mocks.correlationId,
        id: mocks.correlationId,
        createdAt: mocks.TIME_ZERO.ms,
        name: "EVENT",
        stream: "stream",
        version: 2,
        commit: mocks.SHA.value,
        payload: { timestamp: mocks.TIME_ZERO.ms, source: "system" },
      });
    });
  });
});
