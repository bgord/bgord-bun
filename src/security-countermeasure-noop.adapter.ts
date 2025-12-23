import type { SecurityCountermeasurePort } from "./security-countermeasure.port";

export class SecurityCountermeasureNoopAdapter implements SecurityCountermeasurePort {
  async execute() {}
}
