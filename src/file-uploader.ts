import * as bgn from "@bgord/node";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { bodyLimit } from "hono/body-limit";

export const InvalidFileMimeTypeError = new HTTPException(400, {
  message: "invalid_file_mime_type_error",
});

type FileUploaderConfigType = {
  mimeTypes: string[];
  maxFilesSize: bgn.SizeValueType;
};

export class FileUploader {
  static validate(config: FileUploaderConfigType) {
    return [
      bodyLimit({ maxSize: config.maxFilesSize }),

      createMiddleware(async (c, next) => {
        const body = await c.req.raw.clone().formData();

        const file = body.get("file");

        if (!(file instanceof File)) {
          throw InvalidFileMimeTypeError;
        }

        const contentType = new bgn.Mime(file.type);
        const accepted = config.mimeTypes.some((acceptedMimeType) =>
          new bgn.Mime(acceptedMimeType).isSatisfiedBy(contentType)
        );

        if (!accepted) throw InvalidFileMimeTypeError;
        return next();
      }),
    ];
  }
}
