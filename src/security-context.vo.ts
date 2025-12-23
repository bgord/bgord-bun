import type { Client } from "./client.vo";

export class SecurityContext {
  constructor(
    readonly rule: string,
    readonly client: Client,
    readonly userId: string | undefined,
  ) {}
}
