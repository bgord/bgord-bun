import type * as tools from "@bgord/tools";
import type { ImageExifClearPort, ImageExifClearStrategy } from "./image-exif-clear.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageExifClearPort; semaphore: Semaphore };

export class ImageExifClearWithSemaphoreAdapter implements ImageExifClearPort {
  constructor(private readonly deps: Dependencies) {}

  async clear(recipe: ImageExifClearStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.clear(recipe));
  }
}
