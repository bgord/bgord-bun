import type { PrerequisiteVerificationResult } from "./prerequisites.service";

export interface PrerequisiteVerifierPort {
  verify(): Promise<PrerequisiteVerificationResult>;

  get kind(): string;
}
