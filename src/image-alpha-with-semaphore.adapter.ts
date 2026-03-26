import type * as tools from "@bgord/tools";
import type { ImageAlphaPort, ImageAlphaStrategy } from "./image-alpha.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageAlphaPort; semaphore: Semaphore };

export class ImageAlphaWithSemaphoreAdapter implements ImageAlphaPort {
  constructor(private readonly deps: Dependencies) {}

  async flatten(recipe: ImageAlphaStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.flatten(recipe));
  }
}
