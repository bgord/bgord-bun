import { describe, expect, test } from "bun:test";
import { EventLogReaderMemoryAdapter } from "../src/event-log-reader-memory.adapter";
import * as mocks from "./mocks";

const names = ["HOUR_HAS_PASSED_EVENT", "MINUTE_HAS_PASSED_EVENT"];

describe("EventLogReaderMemoryAdapter", () => {
  test("read - no entries", async () => {
    const reader = new EventLogReaderMemoryAdapter([]);

    expect(await reader.read({ names, after: 0, limit: 10 })).toEqual([]);
  });

  test("read - in position order", async () => {
    const reader = new EventLogReaderMemoryAdapter([
      mocks.GenericMinuteHasPassedEventLogEntry,
      mocks.GenericHourHasPassedEventLogEntry,
    ]);

    expect(await reader.read({ names, after: 0, limit: 10 })).toEqual([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);
  });

  test("read - names", async () => {
    const reader = new EventLogReaderMemoryAdapter([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);

    expect(await reader.read({ names: ["MINUTE_HAS_PASSED_EVENT"], after: 0, limit: 10 })).toEqual([
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);
  });

  test("read - after", async () => {
    const reader = new EventLogReaderMemoryAdapter([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);

    expect(await reader.read({ names, after: 1, limit: 10 })).toEqual([
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);
  });

  test("read - limit", async () => {
    const reader = new EventLogReaderMemoryAdapter([
      mocks.GenericHourHasPassedEventLogEntry,
      mocks.GenericMinuteHasPassedEventLogEntry,
    ]);

    expect(await reader.read({ names, after: 0, limit: 1 })).toEqual([
      mocks.GenericHourHasPassedEventLogEntry,
    ]);
  });
});
