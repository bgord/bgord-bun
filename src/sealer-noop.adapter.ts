import type { SealerPort } from "./sealer.port";

export class SealerNoopAdapter implements SealerPort {
  async seal(value: unknown): Promise<string> {
    return `sealed:${JSON.stringify(value)}`;
  }

  async unseal(value: string): Promise<unknown> {
    return JSON.parse(value.replace("sealed:", ""));
  }
}
