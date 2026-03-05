import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as z from "zod/v4";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommandEnvelopeSchema, createCommandEnvelope } from "../src/command-envelope";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("CommandEnvelope", () => {
  test("schema", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));

    await CorrelationStorage.run(mocks.correlationId, () => {
      const result = z.object(CommandEnvelopeSchema).safeParse({
        createdAt: Clock.now().ms,
        id: IdProvider.generate(),
        correlationId: IdProvider.generate(),
      });

      expect(result.success).toEqual(true);
      expect(result.data).toEqual({
        id: mocks.correlationId,
        correlationId: mocks.correlationId,
        createdAt: mocks.TIME_ZERO.ms,
      });
    });
  });

  test("createCommandEnvelope - no correlation id", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));
    expect(() => createCommandEnvelope({ Clock, IdProvider })).toThrow("correlation.storage.missing");
  });

  test("createCommandEnvelope", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, () => {
      expect(() => createCommandEnvelope({ Clock, IdProvider })).not.toThrow();
    });
  });
});
