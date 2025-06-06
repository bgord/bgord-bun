import { expect, jest, spyOn, test } from "bun:test";

import { PrerequisiteStatusEnum } from "../src/prerequisites";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";

const mockMailer = { verify: jest.fn() };

test("passes if mailer.verify succeeds", async () => {
  const mailerVerify = spyOn(mockMailer, "verify").mockResolvedValue(() => Promise.resolve());

  const prerequisite = new PrerequisiteMailer({
    label: "MAILER" as const,
    enabled: true,
    mailer: mockMailer as any,
  });
  const result = await prerequisite.verify();

  expect(result).toBe(PrerequisiteStatusEnum.success);
  expect(prerequisite.status).toBe(PrerequisiteStatusEnum.success);

  mailerVerify.mockRestore();
});

test("fails if mailer.verify throws", async () => {
  const mailerVerify = spyOn(mockMailer, "verify").mockRejectedValue(() => {
    throw new Error("SMTP error");
  });

  const prerequisite = new PrerequisiteMailer({
    label: "MAILER" as const,
    enabled: true,
    mailer: mockMailer as any,
  });
  const result = await prerequisite.verify();

  expect(result).toBe(PrerequisiteStatusEnum.failure);
  expect(prerequisite.status).toBe(PrerequisiteStatusEnum.failure);

  mailerVerify.mockRestore();
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
