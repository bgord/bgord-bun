import type { PrerequisiteVerifierDecorator } from "./prerequisite-verifier.decorator";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export type PrerequisiteLabelType = string;

export class Prerequisite {
  constructor(
    readonly label: PrerequisiteLabelType,
    private readonly verifier: PrerequisiteVerifierPort,
    private readonly decorators: PrerequisiteVerifierDecorator[] = [],
    readonly enabled: boolean = true,
  ) {}

  build(): PrerequisiteVerifierPort {
    return this.decorators.reduce((verifier, decorator) => decorator(verifier), this.verifier);
  }

  get kind() {
    return this.verifier.kind;
  }
}
