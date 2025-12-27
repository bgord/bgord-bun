import type { PrerequisiteVerifierDecorator } from "./prerequisite-verifier.decorator";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export type PrerequisiteLabelType = string;

type PrerequisiteConfigType = { decorators?: PrerequisiteVerifierDecorator[]; enabled?: boolean };

export class Prerequisite {
  private readonly decorators: PrerequisiteVerifierDecorator[];
  readonly enabled: boolean;

  constructor(
    readonly label: PrerequisiteLabelType,
    private readonly verifier: PrerequisiteVerifierPort,
    config?: PrerequisiteConfigType,
  ) {
    this.decorators = config?.decorators ?? [];
    this.enabled = config?.enabled ?? true;
  }

  build(): PrerequisiteVerifierPort {
    return this.decorators.reduceRight((verifier, decorator) => decorator(verifier), this.verifier);
  }

  get kind() {
    return this.verifier.kind;
  }
}
