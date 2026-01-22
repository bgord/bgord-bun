import { describe, expect, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierSQLiteAdapter } from "../src/prerequisite-verifier-sqlite.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierSQLiteAdapter", () => {
  test("success", async () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "ok" }) }) };
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - integrity_check is not ok", async () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "not ok" }) }) };
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Integrity check failed"));
  });

  test("failure - integrity_check is missing", async () => {
    const sqlite = { query: () => ({ get: () => undefined }) };
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Integrity check failed"));
  });

  test("failure - error", async () => {
    const sqlite = { query: () => ({ get: mocks.throwIntentionalError }) };
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    const sqlite = { query: () => ({ get: () => ({ integrity_check: "ok" }) }) };
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(prerequisite.kind).toEqual("sqlite");
  });
});
