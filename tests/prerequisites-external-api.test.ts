import { describe, expect, spyOn, test } from "bun:test";

import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import { PrerequisiteExternalApi } from "../src/prerequisites/external-api";

describe("prerequisites - external api", () => {
  test("passes when ok = true is returned", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue({
      ok: true,
    } as any);

    const result = await new PrerequisiteExternalApi({
      label: "external-api",
      request: () => fetch("http://some-api"),
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);

    globalFetch.mockRestore();
  });

  test("rejects when ok = false is returned", async () => {
    const globalFetch = spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as any);

    const result = await new PrerequisiteExternalApi({
      label: "external-api",
      request: () => fetch("http://some-api"),
    }).verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);

    globalFetch.mockRestore();
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteExternalApi({
      label: "external-api",
      request: () => fetch("http://some-api"),
      enabled: false,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
