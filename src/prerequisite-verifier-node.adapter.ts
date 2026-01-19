import * as tools from "@bgord/tools";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierNodeAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { version: tools.PackageVersion; current: string }) {}

  async verify() {
    try {
      const current = tools.PackageVersion.fromVersionString(this.config.current);

      if (current.isGreaterThanOrEqual(this.config.version)) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`Version: ${this.config.current}`);
    } catch {
      return PrerequisiteVerification.failure(`Invalid version passed: ${this.config.current}`);
    }
  }

  get kind() {
    return "node";
  }
}
