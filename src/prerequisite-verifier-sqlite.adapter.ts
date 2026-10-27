// [BUN DEPENDENCY]
import type { Database } from "bun:sqlite";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { sqlite: Database };

export class PrerequisiteVerifierSQLiteAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const schema = this.config.sqlite.query("SELECT count(*) AS tables FROM sqlite_master;").get() as
        { tables?: number } | undefined;

      if (!schema?.tables) return PrerequisiteVerification.failure("Schema unreadable");
      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "sqlite";
  }
}
