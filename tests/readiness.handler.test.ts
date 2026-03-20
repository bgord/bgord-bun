import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { Port } from "../src/port.vo";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import { ReadinessHandler } from "../src/readiness.handler";
import * as mocks from "./mocks";

describe("ReadinessHandler", () => {
  test("200", async () => {
    const handler = new ReadinessHandler({
      prerequisites: [
        mocks.PrerequisiteOk,
        new Prerequisite("disabled", new mocks.PrerequisiteVerifierPass(), { enabled: false }),
      ],
    });

    expect(await handler.check()).toEqual({
      ok: true,
      details: [{ label: "ok", outcome: PrerequisiteVerification.success }],
    });
  });

  test("503", async () => {
    const handler = new ReadinessHandler({
      prerequisites: [mocks.PrerequisiteOk, mocks.PrerequisiteFail],
    });

    const result = await handler.check();

    expect(result.ok).toEqual(false);
    expect(result.details[0]?.outcome.outcome).toEqual(PrerequisiteVerificationOutcome.success);
    expect(result.details[1]?.outcome.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });

  test("ignores port prerequisite", async () => {
    const handler = new ReadinessHandler({
      prerequisites: [
        mocks.PrerequisiteOk,
        new Prerequisite("port", new PrerequisiteVerifierPortAdapter({ port: v.parse(Port, 3000) })),
      ],
    });

    const result = await handler.check();

    expect(result.ok).toEqual(true);
    expect(result.details.length).toEqual(1);
  });
});
