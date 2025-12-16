import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteSelf } from "../src/prerequisites/self";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteSelf", () => {
  test("success", async () => {
    expect(await new PrerequisiteSelf({ label: "self" }).verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteSelf({ label: "self", enabled: false }).verify(Clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
