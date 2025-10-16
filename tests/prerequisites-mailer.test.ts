import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const mailer = { verify: jest.fn(), send: jest.fn() } as any;

describe("PrerequisiteMailer", () => {
  test("success", async () => {
    spyOn(mailer, "verify").mockResolvedValue(() => Promise.resolve());

    expect(await new PrerequisiteMailer({ label: "mailer", mailer }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure", async () => {
    spyOn(mailer, "verify").mockRejectedValue(new Error(mocks.IntentialError));

    // @ts-expect-error
    expect((await new PrerequisiteMailer({ label: "mailer", mailer }).verify()).error.message).toMatch(
      mocks.IntentialError,
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteMailer({ label: "mailer", enabled: false, mailer }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
