import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";
import { type FileUploaderConfig, FileUploaderMiddleware } from "./file-uploader.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

type Dependencies = { FileTypeDetector: FileTypeDetectorStrategy };

export class FileUploaderHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: FileUploaderMiddleware;

  constructor(config: FileUploaderConfig, deps: Dependencies) {
    this.middleware = new FileUploaderMiddleware(config, deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = await this.middleware.validate(context);

      if (result.valid === false) throw new HTTPException(400, { message: result.error });
      return next();
    });
  }
}
