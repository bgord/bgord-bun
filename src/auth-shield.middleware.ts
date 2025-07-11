import hono from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { Lucia } from "lucia";

import { HashedPassword, Password, PasswordType } from "./passwords.vo";
import { SessionId } from "./session-id.vo";
import { IdType, Username } from "./username.vo";

type AuthShieldConfigType<T> = {
  Username: typeof Username;
  Password: typeof Password;
  HashedPassword: typeof HashedPassword;
  lucia: Lucia;
  findUniqueUserOrThrow: (username: Username) => Promise<T>;
};

export const AccessDeniedAuthShieldError = new HTTPException(403, {
  message: "access_denied_auth_shield",
});

export class AuthShield<T extends { password: PasswordType; id: IdType }> {
  private readonly config: AuthShieldConfigType<T>;

  constructor(
    overrides: Omit<AuthShieldConfigType<T>, "Username" | "Password" | "HashedPassword"> & {
      Username?: typeof Username;
      Password?: typeof Password;
      HashedPassword?: typeof HashedPassword;
    },
  ) {
    const config = {
      Username: overrides.Username ?? Username,
      Password: overrides.Password ?? Password,
      HashedPassword: overrides.HashedPassword ?? HashedPassword,
      lucia: overrides.lucia,
      findUniqueUserOrThrow: overrides.findUniqueUserOrThrow,
    };

    this.config = config;
  }

  verify = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (!user) {
      throw AccessDeniedAuthShieldError;
    }

    return next();
  });

  reverse = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const user = c.get("user");

    if (user) {
      throw AccessDeniedAuthShieldError;
    }

    return next();
  });

  detach = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const cookie = c.req.header("cookie");

    const sessionId = new SessionId(cookie, this.config.lucia).get();

    if (!sessionId) return next();

    await this.config.lucia.invalidateSession(sessionId);

    return next();
  });

  build = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    const cookie = c.req.header("cookie");

    const sessionId = new SessionId(cookie, this.config.lucia).get();

    if (!sessionId) {
      c.set("user", null);
      c.set("session", null);

      return next();
    }

    const { session, user } = await this.config.lucia.validateSession(sessionId);

    if (!session) {
      c.res.headers.set("Set-Cookie", this.config.lucia.createBlankSessionCookie().serialize());
      c.set("user", null);
      c.set("session", null);

      return next();
    }

    if (session.fresh) {
      c.res.headers.set("Set-Cookie", this.config.lucia.createSessionCookie(session.id).serialize());
    }
    c.set("user", user);
    c.set("session", session);

    return next();
  });

  attach = createMiddleware(async (c: hono.Context, next: hono.Next) => {
    try {
      const body = await c.req.raw.clone().formData();

      const username = new this.config.Username(body.get("username") as string);
      const password = new this.config.Password(body.get("password") as string);

      const user = await this.config.findUniqueUserOrThrow(username);

      const hashedPassword = await this.config.HashedPassword.fromHash(user.password);
      await hashedPassword.matchesOrThrow(password);

      const session = await this.config.lucia.createSession(user.id, {});
      const sessionCookie = this.config.lucia.createSessionCookie(session.id);

      c.res.headers.set("Set-Cookie", sessionCookie.serialize());

      return next();
    } catch (_error) {
      throw AccessDeniedAuthShieldError;
    }
  });
}
