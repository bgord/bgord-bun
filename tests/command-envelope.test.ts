import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CommandEnvelopeSchema, command, createCommandEnvelope } from "../src/command-envelope";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("CommandEnvelope", () => {
  test("schema", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));

    await CorrelationStorage.run(mocks.correlationId, () => {
      const result = v.safeParse(v.object(CommandEnvelopeSchema), {
        createdAt: Clock.now().ms,
        id: IdProvider.generate(),
        correlationId: IdProvider.generate(),
      });

      expect(result.success).toEqual(true);
      expect(result.output).toEqual({
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

  test("event", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, () => {
      const Command = v.object({
        ...CommandEnvelopeSchema,
        name: v.literal("COMMAND"),
        payload: v.object({ timestamp: tools.TimestampValue }),
      });

      expect(command(Command, { payload: { timestamp: mocks.TIME_ZERO.ms } }, { Clock, IdProvider })).toEqual(
        {
          correlationId: mocks.correlationId,
          id: mocks.correlationId,
          createdAt: mocks.TIME_ZERO.ms,
          name: "COMMAND",
          payload: { timestamp: mocks.TIME_ZERO.ms },
        },
      );
    });
  });
});
