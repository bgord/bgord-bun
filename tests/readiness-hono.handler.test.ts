import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { PrerequisiteVerificationOutcome } from "../src/prerequisite-verifier.port";
import { ReadinessHonoHandler } from "../src/readiness-hono.handler";
import * as mocks from "./mocks";

describe("ReadinessHonoHandler", () => {
  test("200", async () => {
    const readiness = new ReadinessHonoHandler({ prerequisites: [mocks.PrerequisiteOk] });
    const app = new Hono().get("/readiness", ...readiness.handle());

    const response = await app.request("/readiness");
    const json = await response.json();

    expect(response.status).toEqual(200);
    expect(json.ok).toEqual(true);
  });

  test("503", async () => {
    const readiness = new ReadinessHonoHandler({ prerequisites: [mocks.PrerequisiteFail] });
    const app = new Hono().get("/readiness", ...readiness.handle());

    const response = await app.request("/readiness");
    const json = await response.json();

    expect(response.status).toEqual(503);
    expect(json.ok).toEqual(false);
    expect(json.details[0].outcome.outcome).toEqual(PrerequisiteVerificationOutcome.failure);
  });
});
