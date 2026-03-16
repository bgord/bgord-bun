import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { createEventEnvelope, EventEnvelopeSchema } from "../src/event-envelope";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import * as mocks from "./mocks";

const stream = "stream";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderCryptoAdapter();

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
});
