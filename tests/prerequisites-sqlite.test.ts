import { describe, expect, jest, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteSQLite } from "../src/prerequisites/sqlite";
import * as prereqs from "../src/prerequisites.service";
import * as mocks from "./mocks";

const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteSQLite", () => {
  test("success - integrity_check is ok", async () => {
    const sqlite = {
      query: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ integrity_check: "ok" }) }),
    } as any;

    expect(await new PrerequisiteSQLite({ label: "sqlite", sqlite }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - integrity_check is not ok", async () => {
    const sqlite = {
      query: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ integrity_check: "not ok" }) }),
    } as any;

    expect(await new PrerequisiteSQLite({ label: "sqlite", sqlite }).verify(clock)).toEqual(
      prereqs.Verification.failure({ message: "Integrity check failed" }),
    );
  });

  test("failure - integrity_check is missing", async () => {
    const sqlite = { query: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue(undefined) }) } as any;

    expect(await new PrerequisiteSQLite({ label: "sqlite", sqlite }).verify(clock)).toEqual(
      prereqs.Verification.failure({ message: "Integrity check failed" }),
    );
  });

  test("failure - error", async () => {
    const sqlite = {
      query: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation(() => {
          throw new Error(mocks.IntentialError);
        }),
      }),
    } as any;

    // @ts-expect-error
    expect((await new PrerequisiteSQLite({ label: "sqlite", sqlite }).verify(clock)).error.message).toMatch(
      mocks.IntentialError,
    );
  });

  test("undetermined", async () => {
    const sqlite = {} as any;

    expect(await new PrerequisiteSQLite({ label: "sqlite", sqlite, enabled: false }).verify(clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
