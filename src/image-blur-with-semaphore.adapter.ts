import type * as tools from "@bgord/tools";
import type { ImageBlurPort, ImageBlurStrategy } from "./image-blur.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageBlurPort; semaphore: Semaphore };

export class ImageBlurWithSemaphoreAdapter implements ImageBlurPort {
  constructor(private readonly deps: Dependencies) {}

  async blur(recipe: ImageBlurStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.blur(recipe));
  }
}
