import { timingSafeEqual } from "node:crypto";
import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";
import type { HasRequestHeader } from "./request-context.port";

export type ShieldBasicAuthConfig = { username: BasicAuthUsernameType; password: BasicAuthPasswordType };

export const ShieldBasicAuthStrategyError = { Rejected: "shield.basic.auth.rejected" };

export class ShieldBasicAuthStrategy {
  constructor(private readonly config: ShieldBasicAuthConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    const header = context.request.header("authorization");

    try {
      const credentials = atob(String(header).replace("Basic ", ""));

      const [username, password] = credentials.split(":");

      if (username !== this.config.username) return false;

      if (password?.length !== this.config.password.length) return false;

      return timingSafeEqual(Buffer.from(password), Buffer.from(this.config.password));
    } catch {
      return false;
    }
  }
}
