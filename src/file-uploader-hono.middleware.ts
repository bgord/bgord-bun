import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import {
  type FileUploaderConfig,
  FileUploaderError,
  FileUploaderMiddleware,
} from "./file-uploader.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export const FileUploaderMissingFileError = new HTTPException(400, {
  message: FileUploaderError.MissingFile,
});
export const FileUploaderEmptyFileError = new HTTPException(400, { message: FileUploaderError.EmptyFile });
export const FileUploaderSizeLimitError = new HTTPException(400, { message: FileUploaderError.SizeLimit });
export const FileUploaderInvalidMimeError = new HTTPException(400, {
  message: FileUploaderError.InvalidMime,
});

export class FileUploaderHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: FileUploaderMiddleware;

  constructor(config: FileUploaderConfig) {
    this.middleware = new FileUploaderMiddleware(config);
  }

  handle() {
    return createMiddleware(async (context, next) => {
      const body = await context.req.raw.clone().formData();
      const file = body.get("file");

      const result = this.middleware.validate(file instanceof File ? file : null);

      if (result.valid) return next();

      switch (result.error) {
        case FileUploaderError.MissingFile:
          throw FileUploaderMissingFileError;
        case FileUploaderError.EmptyFile:
          throw FileUploaderEmptyFileError;
        case FileUploaderError.SizeLimit:
          throw FileUploaderSizeLimitError;
        case FileUploaderError.InvalidMime:
          throw FileUploaderInvalidMimeError;
      }
    });
  }
}
