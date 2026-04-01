import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";
import { AntivirusWithLoggerAdapter } from "../src/antivirus-with-logger.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("AntivirusWithLoggerAdapter", () => {
  test("scan - success", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new AntivirusNoopAdapter();
    const adapter = new AntivirusWithLoggerAdapter({ inner, Logger, Clock });

    expect(await adapter.scan(mocks.cleanFile)).toEqual({ clean: true });
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "antivirus",
        message: "Antivirus scan attempt",
        metadata: { size: 3 },
      },
      {
        component: "infra",
        operation: "antivirus",
        message: "Antivirus scan success",
        metadata: { clean: true, duration: expect.any(tools.Duration) },
      },
    ]);
  });

  test("scan - failure", async () => {
    const Logger = new LoggerCollectingAdapter();
    const inner = new AntivirusNoopAdapter();
    using _ = spyOn(inner, "scan").mockImplementation(mocks.throwIntentionalErrorAsync);
    const adapter = new AntivirusWithLoggerAdapter({ inner, Logger, Clock });

    expect(async () => adapter.scan(mocks.cleanFile)).toThrow(mocks.IntentionalError);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        operation: "antivirus",
        message: "Antivirus scan attempt",
        metadata: { size: 3 },
      },
      {
        component: "infra",
        operation: "antivirus",
        message: "Antivirus scan error",
        error: new Error(mocks.IntentionalError),
        metadata: expect.any(tools.Duration),
      },
    ]);
  });
});
