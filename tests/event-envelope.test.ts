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
const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 7));

const deps = { Clock, IdProvider };

describe("EventEnvelope", () => {
  test("schema", () => {
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
    expect(() => createEventEnvelope(stream, deps)).toThrow("correlation.storage.missing");
  });

  test("createEventEnvelope", async () => {
    const id = IdProvider.generate();

    await CorrelationStorage.run(id, () => {
      expect(() => createEventEnvelope(stream, deps)).not.toThrow();
    });
  });

  test("event", async () => {
    await CorrelationStorage.run(mocks.correlationId, () => {
      const Event = v.object({
        ...EventEnvelopeSchema,
        name: v.literal("EVENT"),
        payload: v.object({ timestamp: tools.TimestampValue }),
      });

      expect(event(Event, "stream", { timestamp: mocks.TIME_ZERO.ms }, deps)).toEqual({
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
