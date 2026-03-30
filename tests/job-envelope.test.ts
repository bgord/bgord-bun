import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { JobEnvelopeSchema, job } from "../src/job-envelope";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("JobEnvelopeSchema", () => {
  test("schema", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 2));

    const result = v.safeParse(v.object(JobEnvelopeSchema), {
      createdAt: Clock.now().ms,
      id: IdProvider.generate(),
      correlationId: IdProvider.generate(),
      revision: tools.Revision.INITIAL,
    });

    expect(result.success).toEqual(true);
  });

  test("job - no correlation id", () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    const Job = v.object({
      ...JobEnvelopeSchema,
      name: v.literal("JOB"),
      payload: v.object({ timestamp: tools.TimestampValue }),
    });

    expect(() => job(Job, { timestamp: mocks.TIME_ZERO.ms }, { Clock, IdProvider })).toThrow(
      "correlation.storage.missing",
    );
  });

  test("job", async () => {
    const IdProvider = new IdProviderDeterministicAdapter(tools.repeat(mocks.correlationId, 1));

    await CorrelationStorage.run(mocks.correlationId, () => {
      const Job = v.object({
        ...JobEnvelopeSchema,
        name: v.literal("JOB"),
        payload: v.object({ timestamp: tools.TimestampValue }),
      });

      expect(job(Job, { timestamp: mocks.TIME_ZERO.ms }, { Clock, IdProvider })).toEqual({
        correlationId: mocks.correlationId,
        id: mocks.correlationId,
        createdAt: mocks.TIME_ZERO.ms,
        name: "JOB",
        revision: tools.Revision.INITIAL,
        payload: { timestamp: mocks.TIME_ZERO.ms },
      });
    });
  });
});
