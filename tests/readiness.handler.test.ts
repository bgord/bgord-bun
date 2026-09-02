import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { Port } from "../src/port.vo";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import { ReadinessHandler, ReadinessStatusCode } from "../src/readiness.handler";
import { RedactorNoop } from "../src/redactor-noop.strategy";
import * as mocks from "./mocks";

const redactor = new RedactorNoop();

describe("ReadinessHandler", () => {
  test("200", async () => {
    const handler = new ReadinessHandler({
      redactor,
      prerequisites: [
        mocks.PrerequisiteOk,
        new Prerequisite("disabled", new mocks.PrerequisiteVerifierPass(), { enabled: false }),
      ],
    });

    expect(await handler.check()).toEqual({
      code: ReadinessStatusCode.Ready,
      details: [{ label: "ok", outcome: PrerequisiteVerification.success }],
      headers: { "Cache-Control": "no-store" },
    });
  });

  test("200 - ignores port prerequisite", async () => {
    const handler = new ReadinessHandler({
      redactor,
      prerequisites: [
        mocks.PrerequisiteOk,
        new Prerequisite("port", new PrerequisiteVerifierPortAdapter({ port: v.parse(Port, 3000) })),
      ],
    });

    expect((await handler.check()).details.length).toEqual(1);
  });

  test("503", async () => {
    const handler = new ReadinessHandler({
      redactor,
      prerequisites: [mocks.PrerequisiteOk, mocks.PrerequisiteFail],
    });

    const result = await handler.check();

    expect(result.code).toEqual(ReadinessStatusCode.NotReady);
    expect(result.details[0]?.outcome.outcome).toEqual(PrerequisiteVerificationOutcome.success);
    expect(result.details[1]?.outcome.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
