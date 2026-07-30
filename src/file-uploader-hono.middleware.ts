import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { type FileUploaderConfig, FileUploaderMiddleware } from "./file-uploader.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export class FileUploaderHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: FileUploaderMiddleware;

  constructor(config: FileUploaderConfig) {
    this.middleware = new FileUploaderMiddleware(config);
  }

  handle() {
    return createMiddleware(async (context, next) => {
      const result = await this.middleware.validate(new RequestContextHonoAdapter(context));

      if (result.valid === false) throw new HTTPException(400, { message: result.error });
      return next();
    });
  }
}
