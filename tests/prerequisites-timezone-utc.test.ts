import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteTimezoneUTC } from "../src/prerequisites/timezone-utc";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

describe("prerequisites - timezone utc", () => {
  test("returns success if timezone is valid UTC", async () => {
    const prerequisite = new PrerequisiteTimezoneUTC({
      label: "Timezone Check",
      timezone: tools.Timezone.parse("UTC"),
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);
  });

  test("returns failure if timezone is invalid", async () => {
    const prerequisite = new PrerequisiteTimezoneUTC({
      label: "Timezone Check",
      timezone: tools.Timezone.parse("Europe/Warsaw"),
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteTimezoneUTC({
      label: "Timezone Check",
      timezone: tools.Timezone.parse("UTC"),
      enabled: false,
    });

    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
