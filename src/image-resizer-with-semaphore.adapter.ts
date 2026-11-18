import type * as tools from "@bgord/tools";
import type { ImageResizerPort, ImageResizerStrategy } from "./image-resizer.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageResizerPort; semaphore: Semaphore };

export class ImageResizerWithSemaphoreAdapter implements ImageResizerPort {
  constructor(private readonly deps: Dependencies) {}

  async resize(recipe: ImageResizerStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.resize(recipe));
  }
}
