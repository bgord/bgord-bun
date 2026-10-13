import { describe, expect, jest, test } from "bun:test";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierSQLiteConnectionAdapter } from "../src/prerequisite-verifier-sqlite-connection.adapter";
import * as mocks from "./mocks";

describe("PrerequisiteVerifierSQLiteConnectionAdapter", () => {
  test("success", async () => {
    const query = jest.fn(() => ({ get: () => ({ 1: 1 }) }));
    const sqlite = { query };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteConnectionAdapter({ sqlite });

    const result = await prerequisite.verify();

    expect(result).toEqual(PrerequisiteVerification.success);
    expect(query).toHaveBeenCalledWith("SELECT 1");
  });

  test("failure - error", async () => {
    const sqlite = { query: () => ({ get: mocks.throwIntentionalError }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteConnectionAdapter({ sqlite });

    expect(await prerequisite.verify()).toMatchObject(
      PrerequisiteVerification.failure(mocks.IntentionalError),
    );
  });

  test("kind", () => {
    const sqlite = { query: () => ({ get: () => ({ 1: 1 }) }) };
    // @ts-expect-error Partial access
    const prerequisite = new PrerequisiteVerifierSQLiteConnectionAdapter({ sqlite });

    expect(prerequisite.kind).toEqual("sqlite-connection");
  });
});
