import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import {
  type FileUploaderConfig,
  FileUploaderError,
  FileUploaderMiddleware,
} from "./file-uploader.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class FileUploaderHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: FileUploaderMiddleware;

  constructor(private readonly config: FileUploaderConfig & { field: string }) {
    this.middleware = new FileUploaderMiddleware(config);
  }

  handle() {
    return createMiddleware(async (context, next) => {
      const body = await context.req.raw.clone().formData();
      const file = body.get(this.config.field);

      const result = this.middleware.validate(file instanceof File ? file : null);

      if (result.valid) return next();

      switch (result.error) {
        case FileUploaderError.MissingFile:
          throw new HTTPException(400, { message: FileUploaderError.MissingFile });
        case FileUploaderError.EmptyFile:
          throw new HTTPException(400, { message: FileUploaderError.EmptyFile });
        case FileUploaderError.SizeLimit:
          throw new HTTPException(400, { message: FileUploaderError.SizeLimit });
        case FileUploaderError.InvalidMime:
          throw new HTTPException(400, { message: FileUploaderError.InvalidMime });
      }
    });
  }
}
