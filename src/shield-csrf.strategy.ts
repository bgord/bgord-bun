import type { HasRequestHeader, HasRequestMethod } from "./request-context.port";

const STATE_CHANGING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export type ShieldCsrfConfig = { origin: ReadonlyArray<string> };

export const ShieldCsrfStrategyError = { Rejected: "shield.csrf.rejected" };

export class ShieldCsrfStrategy {
  constructor(private readonly config: ShieldCsrfConfig) {}

  evaluate(context: HasRequestMethod & HasRequestHeader): boolean {
    if (!STATE_CHANGING_METHODS.includes(context.request.method)) return true;

    const origin = context.request.header("origin");

    if (!origin) return true;
    if (!this.config.origin.includes(origin)) return false;
    return true;
  }
}
