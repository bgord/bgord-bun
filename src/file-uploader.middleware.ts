import * as tools from "@bgord/tools";
import type { FileTypeDetectorStrategy } from "./file-type-detector.strategy";
import type { HasRequestForm } from "./request-context.port";

export type FileUploaderConfig = { MimeRegistry: tools.MimeRegistry; maxSize: tools.Size; field: string };

type Dependencies = { FileTypeDetector: FileTypeDetectorStrategy };

export const FileUploaderError = {
  MissingFile: "file.uploader.missing.file",
  EmptyFile: "file.uploader.empty.file",
  InvalidMime: "file.uploader.invalid.mime",
  SizeLimit: "file.uploader.size.limit",
} as const;

export type FileValidationError = (typeof FileUploaderError)[keyof typeof FileUploaderError];

export type FileValidationResult = { valid: true } | { valid: false; error: FileValidationError };

export class FileUploaderMiddleware {
  constructor(
    private readonly config: FileUploaderConfig,
    private readonly deps: Dependencies,
  ) {}

  async validate(context: HasRequestForm): Promise<FileValidationResult> {
    const form = await context.request.form();
    const file = form.get(this.config.field);

    if (!(file instanceof File)) return { valid: false, error: FileUploaderError.MissingFile };
    if (file.size === 0) return { valid: false, error: FileUploaderError.EmptyFile };

    const size = tools.Size.fromBytes(file.size);

    if (size.isGreaterThan(this.config.maxSize)) return { valid: false, error: FileUploaderError.SizeLimit };

    const mime = await this.deps.FileTypeDetector.detect(file);

    if (!mime) return { valid: false, error: FileUploaderError.InvalidMime };

    if (!this.config.MimeRegistry.hasMime(mime)) {
      return { valid: false, error: FileUploaderError.InvalidMime };
    }
    return { valid: true };
  }
}
