import type { RequestHandler } from "express";
import multer from "multer";
import {
  type FileUploaderConfig,
  FileUploaderError,
  FileUploaderMiddleware,
} from "./file-uploader.middleware";
import type { MiddlewareExpressPort } from "./middleware-express.port";

export class FileUploaderExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: FileUploaderMiddleware;
  private readonly parser = multer({ storage: multer.memoryStorage() });

  constructor(config: FileUploaderConfig) {
    this.middleware = new FileUploaderMiddleware(config);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      this.parser.single("file")(request, response, (error) => {
        if (error) return response.status(400).send(FileUploaderError.SizeLimit);

        const multerFile = request.file;

        const file = multerFile
          ? new File([new Uint8Array(multerFile.buffer)], multerFile.originalname, {
              type: multerFile.mimetype,
            })
          : null;

        const result = this.middleware.validate(file);

        if (result.valid) return next();

        switch (result.error) {
          case FileUploaderError.MissingFile:
            return response.status(400).send(FileUploaderError.MissingFile);
          case FileUploaderError.EmptyFile:
            return response.status(400).send(FileUploaderError.EmptyFile);
          case FileUploaderError.SizeLimit:
            return response.status(400).send(FileUploaderError.SizeLimit);
          case FileUploaderError.InvalidMime:
            return response.status(400).send(FileUploaderError.InvalidMime);
        }
      });
    };
  }
}
