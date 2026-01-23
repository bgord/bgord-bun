import type * as tools from "@bgord/tools";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import { CacheSubjectApplicationResolver } from "./cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import type { FileReaderRawPort } from "./file-reader-raw.port";
import type { HashContentStrategy } from "./hash-content.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class FileReaderRawWithCacheAdapter implements FileReaderRawPort {
  constructor(
    private readonly config: { id: string; inner: FileReaderRawPort },
    private readonly deps: Dependencies,
  ) {}

  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<ArrayBuffer> {
    const resolver = new CacheSubjectApplicationResolver(
      [
        new CacheSubjectSegmentFixedStrategy("file_reader_raw"),
        new CacheSubjectSegmentFixedStrategy(this.config.id),
        new CacheSubjectSegmentFixedStrategy(typeof path === "string" ? path : path.get()),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<ArrayBuffer>(subject.hex, () => this.config.inner.read(path));
  }
}
