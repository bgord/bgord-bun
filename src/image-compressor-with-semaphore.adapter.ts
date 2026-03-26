import type * as tools from "@bgord/tools";
import type { ImageCompressorPort, ImageCompressorStrategy } from "./image-compressor.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageCompressorPort; semaphore: Semaphore };

export class ImageCompressorWithSemaphoreAdapter implements ImageCompressorPort {
  constructor(private readonly deps: Dependencies) {}

  async compress(recipe: ImageCompressorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.compress(recipe));
  }
}
