import * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { version: tools.PackageVersion; current: string };

export class PrerequisiteVerifierNodeAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const current = tools.PackageVersion.fromVersionString(this.config.current);

      if (current.isGreaterThanOrEqual(this.config.version)) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`Version: ${this.config.current}`);
    } catch {
      return PrerequisiteVerification.failure(`Invalid version passed: ${this.config.current}`);
    }
  }

  get kind(): string {
    return "node";
  }
}
