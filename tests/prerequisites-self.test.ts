import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteSelf", () => {
  test("success", async () => {
    expect(await new PrerequisiteSelf({ label: "self" }).verify(clock)).toEqual(mocks.VerificationSuccess);
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteSelf({ label: "self", enabled: false }).verify(clock)).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
