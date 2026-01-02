import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { EventEnvelopeSchema, createEventEnvelope } from "../src/event-envelope";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import * as mocks from "./mocks";

const stream = "stream";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderCryptoAdapter();

const deps = { Clock, IdProvider };

describe("EventEnvelope", () => {
  test("schema", () => {
    const result = z.object(EventEnvelopeSchema).safeParse({
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
