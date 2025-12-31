import type { HashFileResult } from "./hash-file.port";

export class Checksum {
  static compare(first: HashFileResult, second: HashFileResult): boolean {
    return (
      first.etag.matches(second.etag) &&
      first.size === second.size &&
      first.lastModified &&
      second.lastModified &&
      first.mime.isSatisfiedBy(second.mime)
    );
  }
}
