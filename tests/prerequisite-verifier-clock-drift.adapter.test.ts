import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteVerifierClockDriftAdapter } from "../src/prerequisite-verifier-clock-drift.adapter";
import type { TimekeeperPort } from "../src/timekeeper.port";
import { TimekeeperNoopAdapter } from "../src/timekeeper-noop.adapter";
import * as mocks from "./mocks";

const skew = tools.Duration.Minutes(1);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Timekeeper = new TimekeeperNoopAdapter({ Clock });
const deps = { Timekeeper, Clock };

export class TimekeeperDelayedAdapter implements TimekeeperPort {
  async get() {
    await Bun.sleep(tools.Duration.Ms(6).ms);
    return null;
  }
}

describe("PrerequisiteVerifierClockDriftAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierClockDriftAdapter({ label: "clock-drift", skew }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - missing timestamp", async () => {
    // @ts-expect-error
    spyOn(Timekeeper, "get").mockResolvedValue(null);
    const prerequisite = new PrerequisiteVerifierClockDriftAdapter({ label: "clock-drift", skew }, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("failure - skew", async () => {
    const duration = tools.Duration.Minutes(1);
    spyOn(Timekeeper, "get").mockResolvedValue(mocks.TIME_ZERO.add(duration));
    const prerequisite = new PrerequisiteVerifierClockDriftAdapter({ label: "clock-drift", skew }, deps);

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: `Difference: ${duration.seconds}s` }),
    );
  });

  test("undetermined - timeout", async () => {
    const prerequisite = new PrerequisiteVerifierClockDriftAdapter(
      { label: "clock-drift", skew, timeout: tools.Duration.Ms(5) },
      { Timekeeper: new TimekeeperDelayedAdapter(), Clock },
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });
});
