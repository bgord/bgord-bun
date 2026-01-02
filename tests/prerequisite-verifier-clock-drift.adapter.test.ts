import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteVerifierClockDriftAdapter } from "../src/prerequisite-verifier-clock-drift.adapter";
import { TimekeeperNoopAdapter } from "../src/timekeeper-noop.adapter";
import * as mocks from "./mocks";

const skew = tools.Duration.Minutes(1);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const Timekeeper = new TimekeeperNoopAdapter({ Clock });
const deps = { Timekeeper, Clock };

const prerequisite = new PrerequisiteVerifierClockDriftAdapter({ skew }, deps);

describe("PrerequisiteVerifierClockDriftAdapter", () => {
  test("success", async () => {
    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - missing timestamp", async () => {
    // @ts-expect-error
    spyOn(Timekeeper, "get").mockResolvedValue(null);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("failure - skew", async () => {
    const duration = tools.Duration.Minutes(1);
    spyOn(Timekeeper, "get").mockResolvedValue(mocks.TIME_ZERO.add(duration));

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: `Difference: ${duration.seconds}s` }));
  });

  test("kind", () => {
    expect(prerequisite.kind).toEqual("clock-drift");
  });
});
