import type * as tools from "@bgord/tools";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { FileReaderJsonOutputType, FileReaderJsonPort } from "./file-reader-json.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };

export class FileReaderJsonWithCacheAdapter implements FileReaderJsonPort {
  constructor(
    private readonly config: { id: string; inner: FileReaderJsonPort },
    private readonly deps: Dependencies,
  ) {}

  async read(
    path: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<FileReaderJsonOutputType> {
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("file_reader_json"),
        new SubjectSegmentFixedStrategy(this.config.id),
        new SubjectSegmentFixedStrategy(typeof path === "string" ? path : path.get()),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<FileReaderJsonOutputType>(subject.hex, () =>
      this.config.inner.read(path),
    );
  }
}
