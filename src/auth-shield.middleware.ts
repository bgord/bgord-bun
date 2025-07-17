// import hono from "hono";
// import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const AccessDeniedAuthShieldError = new HTTPException(403, {
  message: "access_denied_auth_shield",
});
