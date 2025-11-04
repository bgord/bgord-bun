import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteOutsideConnectivity } from "../src/prerequisites/outside-connectivity";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteOutsideConnectivity", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    expect(
      await new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }).verify(clock),
    ).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    expect(
      await new PrerequisiteOutsideConnectivity({ label: "outside-Connectivity" }).verify(clock),
    ).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });

  test("failure - error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentialError));

    expect(
      // @ts-expect-error
      (await new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }).verify(clock)).error
        .message,
    ).toMatch(mocks.IntentialError);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteOutsideConnectivity({ label: "prerequisite", enabled: false }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
