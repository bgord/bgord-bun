import type * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import { Timeout } from "./timeout.service";

export class PrerequisiteVerifierWithTimeoutAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { inner: PrerequisiteVerifierPort; timeout: tools.Duration }) {}

  async verify() {
    try {
      return await Timeout.run<PrerequisiteVerificationResult>(
        this.config.inner.verify(),
        this.config.timeout,
      );
    } catch (error) {
      return PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return this.config.inner.kind;
  }
}
