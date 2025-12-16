import { describe, expect, spyOn, test } from "bun:test";
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
  test("success - log file exists", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);

    expect(await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - log file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);

    expect(await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: `Missing file: ${Logger.getFilePath()?.get()}` }),
    );
  });

  test("failure - exception", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: async () => {
        throw new Error("FS error");
      },
    } as any);

    expect(
      // @ts-expect-error
      (await new PrerequisiteLogFile({ label: "log-file" }, deps).verify(Clock)).error.message,
    ).toMatch(/FS error/);
  });

  test("undetermined - no path", async () => {
    expect(
      await new PrerequisiteLogFile(
        { label: "log-file", enabled: false },
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
