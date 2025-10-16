import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteOutsideConnectivity } from "../src/prerequisites/outside-connectivity";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

describe("PrerequisiteOutsideConnectivity", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    expect(await new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    expect(await new PrerequisiteOutsideConnectivity({ label: "outside-Connectivity" }).verify()).toEqual(
      prereqs.Verification.failure({ message: "HTTP 400" }),
    );
  });

  test("failure - error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentialError));

    expect(
      // @ts-expect-error
      (await new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" }).verify()).error.message,
    ).toMatch(mocks.IntentialError);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteOutsideConnectivity({ label: "prerequisite", enabled: false }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
