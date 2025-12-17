import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteMailer } from "../src/prerequisites/mailer";
import { PrerequisiteStatusEnum } from "../src/prerequisites.service";
import * as mocks from "./mocks";

const Mailer = { verify: jest.fn(), send: jest.fn() } as any;
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Mailer };

describe("PrerequisiteMailer", () => {
  test("success", async () => {
    spyOn(Mailer, "verify").mockResolvedValue(() => Promise.resolve());
    const prerequisite = new PrerequisiteMailer({ label: "mailer" }, deps);

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    spyOn(Mailer, "verify").mockRejectedValue(new Error(mocks.IntentionalError));
    const prerequisite = new PrerequisiteMailer({ label: "mailer" }, deps);

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toMatch(mocks.IntentionalError);
  });

  test("undetermined", async () => {
    const prerequisite = new PrerequisiteMailer({ label: "mailer", enabled: false }, deps);

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });

  test("undetermined - timeout", async () => {
    spyOn(Mailer, "verify").mockImplementation(() => Bun.sleep(tools.Duration.Ms(6).ms));
    const prerequisite = new PrerequisiteMailer({ label: "mailer", timeout: tools.Duration.Ms(5) }, deps);

    expect((await prerequisite.verify(Clock)).status).toEqual(PrerequisiteStatusEnum.failure);
  });
});
