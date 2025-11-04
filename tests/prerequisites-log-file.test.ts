import { describe, expect, spyOn, test } from "bun:test";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";
import * as mocks from "./mocks";

const redactor = new RedactorNoopAdapter();
const logger = new LoggerWinstonProductionAdapter({ app: "test-app", AXIOM_API_TOKEN: "ok", redactor });
const clock = new ClockFixedAdapter(mocks.TIME_ZERO);

describe("PrerequisiteLogFile", () => {
  test("success - log file exists", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);

    expect(await new PrerequisiteLogFile({ logger, label: "log-file" }).verify(clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - log file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);

    expect(await new PrerequisiteLogFile({ logger, label: "log-file" }).verify(clock)).toEqual(
      mocks.VerificationFailure({ message: `Missing file: ${logger.prodLogFile}` }),
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
      (await new PrerequisiteLogFile({ logger, label: "log-file" }).verify(clock)).error.message,
    ).toMatch(/FS error/);
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteLogFile({ logger, label: "log-file", enabled: false }).verify(clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
