import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export type PrerequisiteLabelType = string;

export class Prerequisite {
  constructor(
    readonly label: PrerequisiteLabelType,
    readonly verifier: PrerequisiteVerifierPort,
    readonly enabled: boolean = true,
  ) {}
}
