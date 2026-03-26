import type * as tools from "@bgord/tools";
import type { ImageFormatterPort, ImageFormatterStrategy } from "./image-formatter.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageFormatterPort; semaphore: Semaphore };

export class ImageFormatterWithSemaphoreAdapter implements ImageFormatterPort {
  constructor(private readonly deps: Dependencies) {}

  async format(recipe: ImageFormatterStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.format(recipe));
  }
}
