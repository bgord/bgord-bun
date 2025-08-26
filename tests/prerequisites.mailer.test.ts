import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";

const mockMailer = { verify: jest.fn() };

describe("prerequisites - mailer", () => {
  test("passes if mailer.verify succeeds", async () => {
    spyOn(mockMailer, "verify").mockResolvedValue(() => Promise.resolve());

    const prerequisite = new PrerequisiteMailer({
      label: "MAILER" as const,
      enabled: true,
      mailer: mockMailer as any,
    });
    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.success);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);
  });

  test("fails if mailer.verify throws", async () => {
    spyOn(mockMailer, "verify").mockRejectedValue(new Error("SMTP error"));

    const prerequisite = new PrerequisiteMailer({
      label: "MAILER" as const,
      enabled: true,
      mailer: mockMailer as any,
    });
    const result = await prerequisite.verify();

    expect(result).toBe(PrerequisiteStatusEnum.failure);
    expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteMailer({
      label: "MAILER" as const,
      enabled: false,
      mailer: mockMailer as any,
    });

    const result = await prerequisite.verify();
    expect(result).toBe(PrerequisiteStatusEnum.undetermined);
  });
});
