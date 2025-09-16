import { describe, expect, jest, test } from "bun:test";
import { PrerequisiteSQLite } from "../src/prerequisites/sqlite";
import * as prereqs from "../src/prerequisites.service";

describe("PrerequisiteSQLite", () => {
  test("returns success when PRAGMA integrity_check is ok", async () => {
    const sqlite = {
      query: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ integrity_check: "ok" }) }),
    } as any;

    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure when PRAGMA integrity_check is not ok", async () => {
    const sqlite = {
      query: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ integrity_check: "not ok" }) }),
    } as any;

    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "Integrity_check failed" }),
    );
  });

  test("returns failure when PRAGMA integrity_check result is missing", async () => {
    const sqlite = { query: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue(undefined) }) } as any;

    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "Integrity_check failed" }),
    );
  });

  test("returns failure when an unexpected error is thrown", async () => {
    const sqlite = {
      query: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation(() => {
          throw new Error("boom");
        }),
      }),
    } as any;

    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite });

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/boom/);
  });

  test("returns undetermined when disabled and does not query", async () => {
    const sqlite = {} as any;
    const prerequisite = new PrerequisiteSQLite({ label: "sqlite", sqlite, enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
