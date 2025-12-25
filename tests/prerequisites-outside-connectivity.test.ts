import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteOutsideConnectivity } from "../src/prerequisites/outside-connectivity";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import * as mocks from "./mocks";

describe("PrerequisiteOutsideConnectivity", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);
    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "outside-Connectivity" });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "HTTP 400" }));
  });

  test("failure - error", async () => {
    spyOn(global, "fetch").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteOutsideConnectivity({ label: "outside-connectivity" });

    expect(
      // @ts-expect-error
      (await prerequisite.verify()).error.message,
    ).toMatch(mocks.IntentionalError);
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteOutsideConnectivity({
      label: "outside-connectivity",
      enabled: false,
    });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });

  test("timeout", async () => {
    // @ts-expect-error
    spyOn(global, "fetch").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteOutsideConnectivity({
      label: "outside-connectivity",
      timeout: tools.Duration.Ms(5),
    });

    expect((await prerequisite.verify()).status).toEqual(PrerequisiteStatusEnum.failure);
  });
});
