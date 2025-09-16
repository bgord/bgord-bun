import type { Database } from "bun:sqlite";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSQLite implements prereqs.Prerequisite {
  readonly kind = "sqlite";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly sqlite: Database;

  constructor(config: prereqs.PrerequisiteConfigType & { sqlite: Database }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.sqlite = config.sqlite;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const integrity = this.sqlite.query("PRAGMA integrity_check;").get() as
        | { integrity_check?: string }
        | undefined;

      if (!integrity || (integrity.integrity_check ?? "").toLowerCase() !== "ok") {
        return prereqs.Verification.failure({ message: "Integrity_check failed" });
      }

      return prereqs.Verification.success();
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
