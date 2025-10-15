import { describe, expect, spyOn, test } from "bun:test";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";
import * as prereqs from "../src/prerequisites.service";
import { RedactorNoopAdapter } from "../src/redactor-noop.adapter";

const redactor = new RedactorNoopAdapter();
const logger = new LoggerWinstonProductionAdapter({ app: "test-app", AXIOM_API_TOKEN: "ok", redactor });

describe("prerequisites - log file", () => {
  test("success - log file exists", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true } as any);

    expect(await new PrerequisiteLogFile({ logger, label: "log-file" }).verify()).toEqual(
      prereqs.Verification.success(),
    );
  });

  test("failure - log file does not exist", async () => {
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false } as any);

    expect(await new PrerequisiteLogFile({ logger, label: "log-file" }).verify()).toEqual(
      prereqs.Verification.failure({ message: `Missing file: ${logger.prodLogFile}` }),
    );
  });

  test("failure - exception", async () => {
    spyOn(Bun, "file").mockReturnValue({
      exists: async () => {
        throw new Error("FS error");
      },
    } as any);

    // @ts-expect-error
    expect((await new PrerequisiteLogFile({ logger, label: "log-file" }).verify()).error.message).toMatch(
      /FS error/,
    );
  });

  test("undetermined", async () => {
    expect(await new PrerequisiteLogFile({ logger, label: "log-file", enabled: false }).verify()).toEqual(
      prereqs.Verification.undetermined(),
    );
  });
});
