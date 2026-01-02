import { describe, expect, test } from "bun:test";
import { PrerequisiteVerifierSQLiteAdapter } from "../src/prerequisite-verifier-sqlite.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierSQLiteAdapter", () => {
  test("success", async () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "ok" }) }) } as any;
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - integrity_check is not ok", async () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "not ok" }) }) } as any;
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Integrity check failed" }));
  });

  test("failure - integrity_check is missing", async () => {
    const sqlite = { query: () => ({ get: () => undefined }) } as any;
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Integrity check failed" }));
  });

  test("failure - error", async () => {
    const sqlite = { query: () => ({ get: mocks.throwIntentionalError }) } as any;
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    // @ts-expect-error
    const result = (await prerequisite.verify()).error.message;

    expect(result).toMatch(mocks.IntentionalError);
  });

  test("kind", () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "ok" }) }) } as any;
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(prerequisite.kind).toEqual("sqlite");
  });
});
