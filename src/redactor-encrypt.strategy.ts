import cloneDeep from "lodash/cloneDeep";
import isPlainObject from "lodash/isPlainObject";
import type { RedactorStrategy } from "./redactor.strategy";
import type { SealerPort } from "./sealer.port";

type Dependencies = { Sealer: SealerPort };

export class RedactorEncryptionStrategy implements RedactorStrategy {
  constructor(
    private readonly key: string,
    private readonly deps: Dependencies,
  ) {}

  async redact<T>(input: T): Promise<T> {
    if (!isPlainObject(input)) return input;

    const output = cloneDeep(input);

    // @ts-expect-error
    if (output[this.key]) output[this.key] = await this.deps.Sealer.seal(output[this.key]);

    return output;
  }
}
