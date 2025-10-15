import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteExternalApi } from "../src/prerequisites/external-api";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - external api", () => {
  test("success", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);

    expect(
      await new PrerequisiteExternalApi({ label: "api", request: () => fetch("http://api") }).verify(),
    ).toEqual(prereqs.Verification.success());
  });

  test("failure", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    expect(
      await new PrerequisiteExternalApi({ label: "api", request: () => fetch("http://api") }).verify(),
    ).toEqual(prereqs.Verification.failure({ message: "HTTP 400" }));
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteExternalApi({
        label: "api",
        request: () => fetch("http://api"),
        enabled: false,
      }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
