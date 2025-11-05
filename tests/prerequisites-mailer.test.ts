import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
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

  test("undetermined - timeout", async () => {
    spyOn(mailer, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));

    expect(
      (await new PrerequisiteMailer({ label: "mailer", mailer, timeout: tools.Duration.Ms(5) }).verify(clock))
        .status,
    ).toEqual(PrerequisiteStatusEnum.failure);
  });
});
