import type { SecurityAction, SecurityCountermeasurePort } from "./security-countermeasure.port";
import { SecurityCountermeasureName } from "./security-countermeasure-name.vo";

export class SecurityCountermeasureNoopAdapter implements SecurityCountermeasurePort {
  async execute(): Promise<SecurityAction> {
    return { kind: "allow" };
  }

  get name() {
    return SecurityCountermeasureName.parse("noop");
  }
}
