import type { Database } from "bun:sqlite";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierSQLiteAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly sqlite: Database;

  constructor(config: prereqs.PrerequisiteConfigType & { sqlite: Database }) {
    this.label = config.label;

    this.sqlite = config.sqlite;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const integrity = this.sqlite.query("PRAGMA integrity_check;").get() as
        | { integrity_check?: string }
        | undefined;

      if (!integrity || (integrity.integrity_check ?? "").toLowerCase() !== "ok") {
        return prereqs.PrerequisiteVerification.failure({ message: "Integrity check failed" });
      }
      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "sqlite";
  }
}
