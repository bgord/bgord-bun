import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";
import type { HasRequestHeader } from "./request-context.port";

export type ShieldBasicAuthConfig = { username: BasicAuthUsernameType; password: BasicAuthPasswordType };

export const ShieldBasicAuthStrategyError = { Rejected: "shield.basic.auth.rejected" };

export class ShieldBasicAuthStrategy {
  constructor(private readonly config: ShieldBasicAuthConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    const header = context.request.header("authorization");

    if (!header) return false;

    try {
      const credentials = atob(header.replace("Basic ", ""));

      const [username, password] = credentials.split(":");

      if (username !== this.config.username) return false;
      if (password !== this.config.password) return false;

      return true;
    } catch {
      return false;
    }
  }
}
