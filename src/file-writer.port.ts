import type * as tools from "@bgord/tools";

export type FileWriterContent = ArrayBuffer | Uint8Array | Blob | File | ReadableStream | string;

export interface FileWriterPort {
  write(
    path: tools.FilePathRelative | tools.FilePathAbsolute | string,
    content: FileWriterContent,
  ): Promise<void>;
}
