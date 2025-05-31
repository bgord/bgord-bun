import { bodyLimit } from "hono/body-limit";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const InvalidFileMimeTypeError = new HTTPException(400, {
  message: "invalid_file_mime_type_error",
});

export const FileTooBigError = new HTTPException(400, {
  message: "file_too_big_error",
});

type FileUploaderConfigType = {
  mimeTypes: string[];
  maxFilesSize: bgn.SizeValueType;
};

export class FileUploader {
  static validate(config: FileUploaderConfigType) {
    return [
      bodyLimit({
        maxSize: config.maxFilesSize,
        onError: () => {
          throw FileTooBigError;
        },
      }),

      createMiddleware(async (c, next) => {
        const body = await c.req.raw.clone().formData();

        const file = body.get("file");

        if (!(file instanceof File)) {
          throw InvalidFileMimeTypeError;
        }

        const contentType = new bgn.Mime(file.type);
        const accepted = config.mimeTypes.some((acceptedMimeType) =>
          new bgn.Mime(acceptedMimeType).isSatisfiedBy(contentType),
        );

        if (!accepted) throw InvalidFileMimeTypeError;
        return next();
      }),
    ];
  }
}
