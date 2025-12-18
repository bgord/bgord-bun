import type { HashFileResult } from "./hash-file.port";

export enum ChecksumStrategy {
  etag = "etag",
  complex = "complex",
}

export class Checksum {
  static compare(first: HashFileResult, second: HashFileResult, strategy: ChecksumStrategy): boolean {
    switch (strategy) {
      case ChecksumStrategy.etag:
        return first.etag.matches(second.etag);
      case ChecksumStrategy.complex:
        return (
          first.etag.matches(second.etag) &&
          first.size === second.size &&
          first.lastModified &&
          second.lastModified &&
          first.mime.isSatisfiedBy(second.mime)
        );
    }
  }
}
