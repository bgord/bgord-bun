import { describe, expect, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierSQLiteAdapter } from "../src/prerequisite-verifier-sqlite.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierSQLiteAdapter", () => {
  test("success", async () => {
    const sqlite = { query: () => ({ get: () => ({ tables: 1 }) }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - schema is empty", async () => {
    const sqlite = { query: () => ({ get: () => ({ tables: 0 }) }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Schema unreadable"));
  });

  test("failure - schema is missing", async () => {
    const sqlite = { query: () => ({ get: () => undefined }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Schema unreadable"));
  });

  test("failure - error", async () => {
    const sqlite = { query: () => ({ get: mocks.throwIntentionalError }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    const sqlite = { query: () => ({ get: () => ({ tables: 1 }) }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteAdapter({ sqlite });

    expect(prerequisite.kind).toEqual("sqlite");
  });
});
