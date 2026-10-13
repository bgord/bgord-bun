// [BUN DEPENDENCY]
import type { Database } from "bun:sqlite";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { sqlite: Database };

export class PrerequisiteVerifierSQLiteConnectionAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      this.config.sqlite.query("SELECT 1").get();

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "sqlite-connection";
  }
}
