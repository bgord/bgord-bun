import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AntivirusBuilder } from "../src/antivirus.builder";
import { AntivirusNoopAdapter } from "../src/antivirus-noop.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { Semaphore } from "../src/semaphore.service";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const TimeoutRunner = new TimeoutRunnerNoopAdapter();

const timeout = tools.Duration.MIN;

const limit = tools.Int.positive(1);
const semaphore = new Semaphore({ limit });

const inner = new AntivirusNoopAdapter();

describe("AntivirusBuilder", () => {
  test("build - bare", async () => {
    using innerSend = spyOn(inner, "scan");
    const antivirus = AntivirusBuilder.of(inner).build();

    await antivirus.scan(mocks.cleanFile);

    expect(innerSend).toHaveBeenCalledTimes(1);
  });

  test("build - with logger", async () => {
    const Logger = new LoggerCollectingAdapter();
    const antivirus = AntivirusBuilder.of(inner).withLogger({ Logger, Clock }).build();

    await antivirus.scan(mocks.cleanFile);

    expect(Logger.entries.length).toEqual(2);
  });

  test("build - with timeout", async () => {
    using runnerRun = spyOn(TimeoutRunner, "run");
    const antivirus = AntivirusBuilder.of(inner).withTimeout({ timeout }, { TimeoutRunner }).build();

    await antivirus.scan(mocks.cleanFile);

    expect(runnerRun).toHaveBeenCalledTimes(1);
  });

  test("build - with semaphore", async () => {
    const antivirus = AntivirusBuilder.of(inner).withSemaphore({ semaphore }).build();

    await antivirus.scan(mocks.cleanFile);
  });

  test("build - all", async () => {
    const inner = new AntivirusNoopAdapter();
    const antivirus = AntivirusBuilder.of(inner)
      .withSemaphore({ semaphore })
      .withTimeout({ timeout }, { TimeoutRunner })
      .withLogger({ Logger: new LoggerCollectingAdapter(), Clock })
      .build();

    expect(await antivirus.scan(mocks.cleanFile)).toEqual({ clean: true });
  });
});
