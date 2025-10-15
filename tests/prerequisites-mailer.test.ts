import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import * as prereqs from "../src/prerequisites.service";

const mailer = { verify: jest.fn(), send: jest.fn() } as any;

describe("prerequisites - mailer", () => {
  test("success", async () => {
    spyOn(mailer, "verify").mockResolvedValue(() => Promise.resolve());

    expect(await new PrerequisiteMailer({ label: "mailer", mailer }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    spyOn(mailer, "verify").mockRejectedValue(new Error("SMTP error"));

    // @ts-expect-error
    expect((await new PrerequisiteMailer({ label: "mailer", mailer }).verify()).error.message).toMatch(
      /SMTP error/,
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteMailer({ label: "mailer", enabled: false, mailer }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
