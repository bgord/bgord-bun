import type { FileHashResult } from "./file-hash.port";

export enum ChecksumStrategy {
  etag = "etag",
  complex = "complex",
}

export class Checksum {
  static compare(first: FileHashResult, second: FileHashResult, strategy: ChecksumStrategy): boolean {
    switch (strategy) {
      case ChecksumStrategy.etag:
        return first.etag === second.etag;
      case ChecksumStrategy.complex:
        return (
          first.etag === second.etag &&
          first.size === second.size &&
          first.lastModified &&
          second.lastModified &&
          first.mime.isSatisfiedBy(second.mime)
        );
    }
  }
}
