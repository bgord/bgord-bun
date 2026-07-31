import { timingSafeEqual } from "node:crypto";
import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";
import type { HasRequestHeader } from "./request-context.port";

export type ShieldBasicAuthConfig = {
  username: BasicAuthUsernameType;
  password: BasicAuthPasswordType;
  realm: string;
};

export const ShieldBasicAuthStrategyError = { Rejected: "shield.basic.auth.rejected" };

export class ShieldBasicAuthStrategy {
  constructor(private readonly config: ShieldBasicAuthConfig) {}

  evaluate(context: HasRequestHeader): boolean {
    const header = context.request.header("authorization");

    try {
      const credentials = atob(String(header).replace("Basic ", ""));

      const index = credentials.indexOf(":");

      if (index === -1) return false;

      const username = credentials.slice(0, index);
      const password = credentials.slice(index + 1);

      if (username !== this.config.username) return false;

      if (password.length !== this.config.password.length) return false;

      return timingSafeEqual(Buffer.from(password), Buffer.from(this.config.password));
    } catch {
      return false;
    }
  }
}
