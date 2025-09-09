import { describe, expect, spyOn, test } from "bun:test";
import { LoggerWinstonProductionAdapter } from "../src/logger-winston-production.adapter";
import { PrerequisiteLogFile } from "../src/prerequisites/log-file";
import * as prereqs from "../src/prerequisites.service";

const logger = new LoggerWinstonProductionAdapter({ app: "test-app", AXIOM_API_TOKEN: "ok" });

describe("prerequisites - log file", () => {
  test("returns success when log file exists", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ exists: async () => true });

    const prerequisite = new PrerequisiteLogFile({ logger, label: "log-file" });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("returns failure when log file does not exist", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({ exists: async () => false });

    const prerequisite = new PrerequisiteLogFile({ logger, label: "log-file" });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: `Missing file: ${logger.prodLogFile}` }),
    );
  });

  test("returns failure on exception", async () => {
    // @ts-expect-error
    spyOn(Bun, "file").mockReturnValue({
      exists: async () => {
        throw new Error("FS error");
      },
    });

    const prerequisite = new PrerequisiteLogFile({ logger, label: "log-file" });
    // @ts-expect-error
    expect((await prerequisite.verify()).error.message).toMatch(/FS error/);
  });

  test("returns undetermined when disabled", async () => {
    const prerequisite = new PrerequisiteLogFile({ logger, label: "log-file", enabled: false });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
