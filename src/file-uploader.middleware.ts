import * as tools from "@bgord/tools";
import { bodyLimit } from "hono/body-limit";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

type FileUploaderConfigType = { mimeTypes: tools.Mime[]; maxFilesSize: tools.Size };

export const FileUploaderInvalidMimeError = new HTTPException(400, {
  message: "file.uploader.invalid.mime",
});

export const FileUploaderTooBigError = new HTTPException(400, { message: "file.uploader.too.big" });

export class FileUploader {
  static validate(config: FileUploaderConfigType) {
    return [
      bodyLimit({
        maxSize: config.maxFilesSize.toBytes(),
        onError: () => {
          throw FileUploaderTooBigError;
        },
      }),

      createMiddleware(async (c, next) => {
        const body = await c.req.raw.clone().formData();

        const file = body.get("file");

        if (!(file instanceof File)) throw FileUploaderInvalidMimeError;

        const contentType = tools.Mime.fromString(file.type);
        const accepted = config.mimeTypes.some((accepted) => accepted.isSatisfiedBy(contentType));

        if (!accepted) throw FileUploaderInvalidMimeError;
        return next();
      }),
    ];
  }
}
