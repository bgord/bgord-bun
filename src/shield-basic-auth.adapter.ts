import { basicAuth } from "hono/basic-auth";
import { createMiddleware } from "hono/factory";
import type { BasicAuthPasswordType } from "./basic-auth-password.vo";
import type { BasicAuthUsernameType } from "./basic-auth-username.vo";
import type { ShieldPort } from "./shield.port";

type ShieldBasicAuthConfigType = { username: BasicAuthUsernameType; password: BasicAuthPasswordType };

export class ShieldBasicAuthAdapter implements ShieldPort {
  private readonly basicAuth;

  constructor(config: ShieldBasicAuthConfigType) {
    this.basicAuth = basicAuth(config);
  }

  verify = createMiddleware(async (c, next) => this.basicAuth(c, next));
}
