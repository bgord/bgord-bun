import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LogLevelEnum } from "../src/logger.port";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";
import * as mocks from "./mocks";

const redactor = new RedactorNoopAdapter();
const Logger = new LoggerWinstonProductionAdapter({
  app: "test-app",
  AXIOM_API_TOKEN: "ok",
  redactor,
}).create(LogLevelEnum.http);

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Logger };

describe("PrerequisiteLogFile", () => {
  test("success", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);

    expect(await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);

    expect(await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File does not exist" }),
    );
  });

  test("failure - existence check error", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: async () => {
        throw new Error(mocks.IntentialError);
      },
    } as any);

    expect(
      // @ts-expect-error
      (await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).error.message,
    ).toMatch(mocks.IntentialError);
  });

  test("failure - file not readable", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentialError);
      return undefined;
    });

    expect(await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File is not readable" }),
    );
  });

  test("failure - file not writeable", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentialError);
      return undefined;
    });

    expect(await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: "File is not writable" }),
    );
  });

  test("undetermined - no path", async () => {
    expect(
      await new PrerequisiteLogFile(
        { label: "log-file", enabled: true },
        { Logger: new LoggerNoopAdapter() },
      ).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteLogFile({ label: "log-file", enabled: false }, deps).verify(Clock)).toEqual(
      mocks.VerificationUndetermined,
    );
  });
});
