import type * as tools from "@bgord/tools";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { FileReaderTextPort } from "./file-reader-text.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = { CacheResolver: CacheResolverStrategy; HashContent: HashContentStrategy };
type Config = { id: string; inner: FileReaderTextPort };

export class FileReaderTextWithCacheAdapter implements FileReaderTextPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<string> {
    const resolver = new SubjectApplicationResolver(
      [
        new SubjectSegmentFixedStrategy("file_reader_text"),
        new SubjectSegmentFixedStrategy(this.config.id),
        new SubjectSegmentFixedStrategy(typeof path === "string" ? path : path.get()),
      ],
      this.deps,
    );

    const subject = await resolver.resolve();

    return this.deps.CacheResolver.resolve<string>(subject.hex, () => this.config.inner.read(path));
  }
}
