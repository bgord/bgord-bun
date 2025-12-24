import type { SecurityAction, SecurityCountermeasurePort } from "./security-countermeasure.port";

export class SecurityCountermeasureNoopAdapter implements SecurityCountermeasurePort {
  async execute(): Promise<SecurityAction> {
    return { kind: "allow" };
  }

  get name() {
    return "noop";
  }
}
