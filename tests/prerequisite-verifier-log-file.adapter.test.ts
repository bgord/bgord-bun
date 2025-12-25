import { describe, expect, spyOn, test } from "bun:test";
import * as fs from "node:fs/promises";
import { LogLevelEnum } from "../src/logger.port";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteVerifierLogFileAdapter } from "../src/prerequisite-verifier-log-file.adapter";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";
import * as mocks from "./mocks";

const redactor = new RedactorNoopAdapter();
const Logger = new LoggerWinstonProductionAdapter({ app: "test-app", redactor }).create(LogLevelEnum.http);
const deps = { Logger };

describe("PrerequisiteVerifierLogFileAdapter", () => {
  test("success", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockResolvedValue(undefined);
    const prerequisite = new PrerequisiteVerifierLogFileAdapter(deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);
    const prerequisite = new PrerequisiteVerifierLogFileAdapter(deps);

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "File does not exist" }),
    );
  });

  test("failure - existence check error", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: mocks.throwIntentionalErrorAsync } as any);
    const prerequisite = new PrerequisiteVerifierLogFileAdapter(deps);

    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(mocks.IntentionalError);
  });

  test("failure - file not readable", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.R_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierLogFileAdapter(deps);

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "File is not readable" }),
    );
  });

  test("failure - file not writeable", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);
    spyOn(fs, "access").mockImplementation(async (_, mode) => {
      if (mode === fs.constants.W_OK) throw new Error(mocks.IntentionalError);
      return undefined;
    });
    const prerequisite = new PrerequisiteVerifierLogFileAdapter(deps);

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "File is not writable" }),
    );
  });

  test("undetermined - no path", async () => {
    const prerequisite = new PrerequisiteVerifierLogFileAdapter({ Logger: new LoggerNoopAdapter() });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationUndetermined);
  });
});
