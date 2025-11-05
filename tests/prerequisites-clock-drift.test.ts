import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteClockDrift } from "../src/prerequisites/clock-drift";
import type { TimekeeperPort } from "../src/timekeeper.port";
import { TimekeeperNoopAdapter } from "../src/timekeeper-noop.adapter";
import * as mocks from "./mocks";

const skew = tools.Duration.Minutes(1);
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const timekeeper = new TimekeeperNoopAdapter(clock);

export class TimekeeperDelayedAdapter implements TimekeeperPort {
  async get() {
    await Bun.sleep(tools.Duration.Ms(6).ms);
    return null;
  }
}

describe("PrerequisiteClockDrift", () => {
  test("success", async () => {
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", skew, timekeeper }).verify(clock),
    ).toEqual(mocks.VerificationSuccess);
  });

  test("failure - missing timestamp", async () => {
    // @ts-expect-error
    spyOn(timekeeper, "get").mockResolvedValue(null);
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", skew, timekeeper }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });

  test("failure - skew", async () => {
    const duration = tools.Duration.Minutes(1);
    spyOn(timekeeper, "get").mockResolvedValue(mocks.TIME_ZERO.add(duration));
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", skew, timekeeper }).verify(clock),
    ).toEqual(mocks.VerificationFailure({ message: `Difference: ${duration.seconds}s` }));
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", enabled: false, skew, timekeeper }).verify(
        clock,
      ),
    ).toEqual(mocks.VerificationUndetermined);
  });

  test("undetermined - timeout", async () => {
    expect(
      await new PrerequisiteClockDrift({
        label: "clock-drift",
        skew,
        timekeeper: new TimekeeperDelayedAdapter(),
        timeout: tools.Duration.Ms(5),
      }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
