import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import * as mocks from "./mocks";

const Mailer = { verify: jest.fn(), send: jest.fn() } as any;
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const deps = { Mailer };

describe("PrerequisiteMailer", () => {
  test("success", async () => {
    spyOn(Mailer, "verify").mockResolvedValue(() => Promise.resolve());

    expect(await new PrerequisiteMailer({ label: "mailer" }, deps).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure", async () => {
    spyOn(Mailer, "verify").mockRejectedValue(new Error(mocks.IntentialError));

    // @ts-expect-error
    expect((await new PrerequisiteMailer({ label: "mailer" }, deps).verify(clock)).error.message).toMatch(
      mocks.IntentialError,
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteMailer({ label: "mailer", enabled: false }, deps).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });

  test("undetermined - timeout", async () => {
    spyOn(Mailer, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));

    expect(
      (await new PrerequisiteMailer({ label: "mailer", timeout: tools.Duration.Ms(5) }, deps).verify(clock))
        .status,
    ).toEqual(PrerequisiteStatusEnum.failure);
  });
});
