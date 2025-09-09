import { describe, expect, spyOn, test } from "bun:test";
import { PrerequisiteExternalApi } from "../src/prerequisites/external-api";
import * as prereqs from "../src/prerequisites.service";

describe("prerequisites - external api", () => {
  test("passes when ok = true is returned", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: true } as any);
    const result = await new PrerequisiteExternalApi({
      label: "external-api",
      request: () => fetch("http://some-api"),
    }).verify();

    expect(result).toEqual(prereqs.Verification.success());
  });

  test("rejects when ok = false is returned", async () => {
    spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 400 } as any);

    const result = await new PrerequisiteExternalApi({
      label: "external-api",
      request: () => fetch("http://some-api"),
    }).verify();

    expect(result).toEqual(prereqs.Verification.failure({ message: "HTTP 400" }));
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteExternalApi({
      label: "external-api",
      request: () => fetch("http://some-api"),
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
