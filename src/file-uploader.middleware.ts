import * as tools from "@bgord/tools";

export type FileUploaderConfig = { MimeRegistry: tools.MimeRegistry; maxSize: tools.Size };

export const FileUploaderError = {
  MissingFile: "file.uploader.missing.file",
  EmptyFile: "file.uploader.empty.file",
  InvalidMime: "file.uploader.invalid.mime",
  SizeLimit: "file.uploader.size.limit",
} as const;

export type FileValidationError = (typeof FileUploaderError)[keyof typeof FileUploaderError];

export type FileValidationResult = { valid: true } | { valid: false; error: FileValidationError };

export class FileUploaderMiddleware {
  constructor(private readonly config: FileUploaderConfig) {}

  validate(file: File | null): FileValidationResult {
    if (!file) return { valid: false, error: FileUploaderError.MissingFile };
    if (file.size === 0) return { valid: false, error: FileUploaderError.EmptyFile };

    const size = tools.Size.fromBytes(file.size);

    if (size.isGreaterThan(this.config.maxSize)) return { valid: false, error: FileUploaderError.SizeLimit };

    const mime = tools.Mime.fromString(file.type);

    if (!this.config.MimeRegistry.hasMime(mime)) {
      return { valid: false, error: FileUploaderError.InvalidMime };
    }
    return { valid: true };
  }
}
