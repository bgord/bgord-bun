import type { SecurityAction, SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import { SecurityCountermeasureName } from "./security-countermeasure-name.vo";

export class SecurityCountermeasureNoopStrategy implements SecurityCountermeasureStrategy {
  async execute(): Promise<SecurityAction> {
    return { kind: "allow" };
  }

  get name() {
    return SecurityCountermeasureName.parse("noop");
  }
}
