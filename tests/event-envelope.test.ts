import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { createEventEnvelope, EventEnvelopeSchema, event } from "../src/event-envelope";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";

const stream = "stream";
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("EventEnvelope", () => {
  test("schema", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));

    const result = v.safeParse(v.object(EventEnvelopeSchema), {
      createdAt: Clock.now().ms,
      id: IdProvider.generate(),
      correlationId: IdProvider.generate(),
      stream,
      version: 1,
      revision: undefined,
    });

    expect(result.success).toEqual(true);
  });

  test("createEventEnvelope - no correlation id", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    expect(() => createEventEnvelope(stream, { Clock, IdProvider })).toThrow("correlation.storage.missing");
  });

  test("createEventEnvelope", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, () => {
      expect(() => createEventEnvelope(stream, { IdProvider, Clock })).not.toThrow();
    });
  });

  test("event", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, () => {
      const Event = v.object({
        ...EventEnvelopeSchema,
        name: v.literal("EVENT"),
        payload: v.object({ timestamp: tools.TimestampValue }),
      });

      expect(event(Event, stream, { timestamp: mocks.TIME_ZERO.ms }, { Clock, IdProvider })).toEqual({
        correlationId: mocks.correlationId,
        id: mocks.correlationId,
        createdAt: mocks.TIME_ZERO.ms,
        name: "EVENT",
        stream: "stream",
        version: 1,
        payload: { timestamp: mocks.TIME_ZERO.ms },
      });
    });
  });
});
