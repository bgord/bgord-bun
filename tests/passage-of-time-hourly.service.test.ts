import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { PassageOfTimeHourly } from "../src/modules/system/services/passage-of-time-hourly.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId]);
const deps = { Clock, IdProvider, EventStore: { save: async () => {}, saveAfter: async () => {} } };

describe("PassageOfTimeHourly", async () => {
  const service = new PassageOfTimeHourly(deps);

  test("correct path", async () => {
    const eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => service.process());

    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericHourHasPassedEvent]);
  });
});
