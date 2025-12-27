import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { CorrelationStorage } from "../src/correlation-storage.service";
import { IdProviderDeterministicAdapter } from "../src/id-provider-deterministic.adapter";
import { JobHandlerBareStrategy } from "../src/job-handler-bare.strategy";
import { PassageOfTimeHourly } from "../src/modules/system/services/passage-of-time-hourly.service";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const EventStore = { save: async () => {}, saveAfter: async () => {} };

describe("PassageOfTimeHourly", async () => {
  test("correct path", async () => {
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const deps = { Clock, IdProvider, EventStore };
    const service = new PassageOfTimeHourly(deps);
    const eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => service.process());

    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericHourHasPassedEvent]);
  });

  test("job handler", async () => {
    const IdProvider = new IdProviderDeterministicAdapter([mocks.correlationId, mocks.correlationId]);
    const deps = { Clock, IdProvider, EventStore };
    const JobHandler = new JobHandlerBareStrategy(deps);
    const service = new PassageOfTimeHourly(deps);
    const eventStoreSave = spyOn(deps.EventStore, "save");

    await CorrelationStorage.run(mocks.correlationId, async () => JobHandler.handle(service)());

    expect(eventStoreSave).toHaveBeenCalledWith([mocks.GenericHourHasPassedEvent]);
  });
});
