import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteSelf", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteSelf({ label: "self" });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteSelf({ label: "self", enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
