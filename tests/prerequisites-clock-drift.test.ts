import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteClockDrift } from "../src/prerequisites/clock-drift";
import type { TimekeeperPort } from "../src/timekeeper.port";
import { TimekeeperNoopAdapter } from "../src/timekeeper-noop.adapter";
import * as mocks from "./mocks";

const skew = tools.Duration.Minutes(1);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Timekeeper = new TimekeeperNoopAdapter({ Clock });
const deps = { Timekeeper };

export class TimekeeperDelayedAdapter implements TimekeeperPort {
  async get() {
    await Bun.sleep(tools.Duration.Ms(6).ms);
    return null;
  }
}

describe("PrerequisiteClockDrift", () => {
  test("success", async () => {
    expect(await new PrerequisiteClockDrift({ label: "clock-drift", skew }, deps).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - missing timestamp", async () => {
    // @ts-expect-error
    spyOn(Timekeeper, "get").mockResolvedValue(null);
    expect(await new PrerequisiteClockDrift({ label: "clock-drift", skew }, deps).verify(Clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });

  test("failure - skew", async () => {
    const duration = tools.Duration.Minutes(1);
    spyOn(Timekeeper, "get").mockResolvedValue(mocks.TIME_ZERO.add(duration));

    expect(await new PrerequisiteClockDrift({ label: "clock-drift", skew }, deps).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: `Difference: ${duration.seconds}s` }),
    );
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteClockDrift({ label: "clock-drift", enabled: false, skew }, deps).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });

  test("undetermined - timeout", async () => {
    expect(
      await new PrerequisiteClockDrift(
        { label: "clock-drift", skew, timeout: tools.Duration.Ms(5) },
        { Timekeeper: new TimekeeperDelayedAdapter() },
      ).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
