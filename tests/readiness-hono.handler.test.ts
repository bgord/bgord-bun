import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import * as v from "valibot";
import { Port } from "../src/port.vo";
import { Prerequisite } from "../src/prerequisite.vo";
import { PrerequisiteVerification, PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierPortAdapter } from "../src/prerequisite-verifier-port.adapter";
import { ReadinessHonoHandler } from "../src/readiness-hono.handler";
import * as mocks from "./mocks";

describe("ReadinessHonoHandler", () => {
  test("200", async () => {
    const readiness = new ReadinessHonoHandler({ prerequisites: [mocks.PrerequisiteOk] });
    const app = new Hono().get("/readiness", ...readiness.handle());

    const response = await app.request("/readiness");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(Object.fromEntries(response.headers.entries())).toEqual({
      "cache-control": "no-store",
      "content-type": "application/json;charset=utf-8",
    });
    expect(json).toEqual([{ label: "ok", outcome: PrerequisiteVerification.success }]);
  });

  test("200 - ignores port prerequisite", async () => {
    const readiness = new ReadinessHonoHandler({
      prerequisites: [
        mocks.PrerequisiteOk,
        new Prerequisite("port", new PrerequisiteVerifierPortAdapter({ port: v.parse(Port, 3000) })),
      ],
    });
    const app = new Hono().get("/readiness", ...readiness.handle());

    const response = await app.request("/readiness");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.length).toEqual(1);
  });

  test("503", async () => {
    const readiness = new ReadinessHonoHandler({ prerequisites: [mocks.PrerequisiteFail] });
    const app = new Hono().get("/readiness", ...readiness.handle());

    const response = await app.request("/readiness");
    const json = await response.json();

    expect(response.status).toEqual(503);
    expect(json[0].outcome.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
