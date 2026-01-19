import type { Database } from "bun:sqlite";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierSQLiteAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { sqlite: Database }) {}

  async verify() {
    try {
      const integrity = this.config.sqlite.query("PRAGMA integrity_check;").get() as
        | { integrity_check?: string }
        | undefined;

      if (!(integrity && integrity.integrity_check) || integrity.integrity_check.toLowerCase() !== "ok") {
        return PrerequisiteVerification.failure("Integrity check failed");
      }
      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind() {
    return "sqlite";
  }
}
