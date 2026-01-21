import type { SecurityAction, SecurityCountermeasureStrategy } from "./security-countermeasure.strategy";
import {
  SecurityCountermeasureName,
  SecurityCountermeasureNameType,
} from "./security-countermeasure-name.vo";

export class SecurityCountermeasureNoopStrategy implements SecurityCountermeasureStrategy {
  async execute(): Promise<SecurityAction> {
    return { kind: "allow" };
  }

  get name(): SecurityCountermeasureNameType {
    return SecurityCountermeasureName.parse("noop");
  }
}
