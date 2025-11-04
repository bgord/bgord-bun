import { describe, expect, jest, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import * as mocks from "./mocks";

const mailer = { verify: jest.fn(), send: jest.fn() } as any;
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteMailer", () => {
  test("success", async () => {
    spyOn(mailer, "verify").mockResolvedValue(() => Promise.resolve());

    expect(await new PrerequisiteMailer({ label: "mailer", mailer }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    spyOn(mailer, "verify").mockRejectedValue(new Error(mocks.IntentialError));

    // @ts-expect-error
    expect((await new PrerequisiteMailer({ label: "mailer", mailer }).verify(clock)).error.message).toMatch(
      mocks.IntentialError,
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteMailer({ label: "mailer", enabled: false, mailer }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
