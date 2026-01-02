import { describe, expect, test } from "bun:test";
import { z } from "zod/v4";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommandEnvelopeSchema, createCommandEnvelope } from "../src/command-envelope";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderCryptoAdapter } from "../src/id-provider-crypto.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderCryptoAdapter();

const deps = { Clock, IdProvider };

describe("CommandEnvelope", () => {
  test("schema", () => {
    const result = z.object(CommandEnvelopeSchema).safeParse({
      createdAt: Clock.now().ms,
      id: IdProvider.generate(),
      correlationId: IdProvider.generate(),
    });

    expect(result.success).toEqual(true);
  });

  test("createCommandEnvelope - no correlation id", () => {
    expect(() => createCommandEnvelope(deps)).toThrow("correlation.storage.missing");
  });

  test("createCommandEnvelope", async () => {
    const id = IdProvider.generate();

    await CorrelationStorage.run(id, () => {
      expect(() => createCommandEnvelope(deps)).not.toThrow();
    });
  });
});
