import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import * as prereqs from "../src/prerequisites.service";

const mockMailer = { verify: jest.fn(), send: jest.fn() };

describe("prerequisites - mailer", () => {
  test("passes if mailer.verify succeeds", async () => {
    spyOn(mockMailer, "verify").mockResolvedValue(() => Promise.resolve());
    const prerequisite = new PrerequisiteMailer({ label: "Mailer", mailer: mockMailer as any });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.success());
  });

  test("fails if mailer.verify throws", async () => {
    spyOn(mockMailer, "verify").mockRejectedValue(new Error("SMTP error"));
    const prerequisite = new PrerequisiteMailer({ label: "Mailer", mailer: mockMailer as any });
    const result = await prerequisite.verify();
    // @ts-expect-error
    expect(result.error.message).toMatch(/SMTP error/);
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteMailer({ label: "Mailer", enabled: false, mailer: mockMailer });
    const result = await prerequisite.verify();
    expect(result).toEqual(prereqs.Verification.undetermined());
  });
});
