import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import * as prereqs from "../src/prerequisites.service";

const mockMailer = { verify: jest.fn(), send: jest.fn() };

describe("prerequisites - mailer", () => {
  test("passes if mailer.verify succeeds", async () => {
    spyOn(mockMailer, "verify").mockResolvedValue(() => Promise.resolve());

    const prerequisite = new PrerequisiteMailer({ label: "mailer", mailer: mockMailer as any });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("fails if mailer.verify throws", async () => {
    spyOn(mockMailer, "verify").mockRejectedValue(new Error("SMTP error"));

    const prerequisite = new PrerequisiteMailer({ label: "mailer", mailer: mockMailer as any });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/SMTP error/);
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteMailer({ label: "mailer", enabled: false, mailer: mockMailer });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
