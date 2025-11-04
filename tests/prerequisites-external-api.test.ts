import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteExternalApi } from "../src/prerequisites/external-api";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteExternalApi", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    expect(
      await new PrerequisiteExternalApi({ label: "api", request: () => fetch("http://api") }).verify(clock),
    ).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    expect(
      await new PrerequisiteExternalApi({ label: "api", request: () => fetch("http://api") }).verify(clock),
    ).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteExternalApi({
        label: "api",
        request: () => fetch("http://api"),
        enabled: false,
      }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
