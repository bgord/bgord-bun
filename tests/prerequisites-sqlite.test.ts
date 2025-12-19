import { describe, expect, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteSQLite } from "../src/prerequisites/sqlite";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteSQLite", () => {
  test("success", async () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "ok" }) }) } as any;
    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationSuccess);
  });

  test("failure - integrity_check is not ok", async () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "not ok" }) }) } as any;
    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Integrity check failed" }),
    );
  });

  test("failure - integrity_check is missing", async () => {
    const sqlite = { query: () => ({ get: () => undefined }) } as any;
    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    expect(await prerequisite.verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "Integrity check failed" }),
    );
  });

  test("failure - error", async () => {
    const sqlite = { query: () => ({ get: mocks.throwIntentionalError }) } as any;
    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    // @ts-expect-error
    expect((await prerequisite.verify(Clock)).error.message).toMatch(mocks.IntentionalError);
  });

  test("undetermined", async () => {
    const sqlite = {} as any;
    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite, enabled: false });

    expect(await prerequisite.verify(Clock)).toEqual(mocks.VerificationUndetermined);
  });
});
