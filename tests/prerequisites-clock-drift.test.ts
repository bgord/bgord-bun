import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteClockDrift } from "../src/prerequisites/clock-drift";
import * as prereqs from "../src/prerequisites.service";
import { TimekeeperNoopAdapter } from "../src/timekeeper-noop.adapter";
import * as mocks from "./mocks";

const skew = tools.Duration.Minutes(1);
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const timekeeper = new TimekeeperNoopAdapter(clock);

describe("PrerequisiteClockDrift", () => {
  test("success", async () => {
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", skew, clock, timekeeper }).verify(),
    ).toEqual(prereqs.Verification.success());
  });

  test("failure - missing timestamp", async () => {
    // @ts-expect-error
    spyOn(timekeeper, "get").mockResolvedValue(null);
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", skew, clock, timekeeper }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });

  test("failure - skew", async () => {
    const duration = tools.Duration.Minutes(1);
    spyOn(timekeeper, "get").mockResolvedValue(mocks.TIME_ZERO.add(duration));
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", skew, clock, timekeeper }).verify(),
    ).toEqual(prereqs.Verification.failure({ message: `Difference: ${duration.seconds}s` }));
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteClockDrift({
        label: "clock-drift",
        enabled: false,
        skew,
        clock,
        timekeeper,
      }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
