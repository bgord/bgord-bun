import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";
import * as mocks from "./mocks";

const redactor = new RedactorNoopAdapter();
const Logger = new LoggerWinstonProductionAdapter({ app: "test-app", AXIOM_API_TOKEN: "ok", redactor });
const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteLogFile", () => {
  test("success - log file exists", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);

    expect(await new PrerequisiteLogFile({ Logger, label: "log-file" }).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - log file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);

    expect(await new PrerequisiteLogFile({ Logger, label: "log-file" }).verify(Clock)).toEqual(
      mocks.VerificationFailure({ message: `Missing file: ${Logger.prodLogFile}` }),
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
      (await new PrerequisiteLogFile({ Logger, label: "log-file" }).verify(Clock)).error.message,
    ).toMatch(/FS error/);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteLogFile({ Logger, label: "log-file", enabled: false }).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
