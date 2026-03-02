import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import { ApiVersionMiddleware } from "./api-version.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class ApiVersionHonoNoopMiddleware implements MiddlewareHonoPort {
  constructor(private readonly version: tools.PackageVersion) {}

  handle(): MiddlewareHandler {
    return async (c, next) => {
      c.res.headers.set(ApiVersionMiddleware.HEADER_NAME, this.version.toString());

      return next();
    };
  }
}
