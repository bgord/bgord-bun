import type * as tools from "@bgord/tools";
import type { ImageGrayscalePort, ImageGrayscaleStrategy } from "./image-grayscale.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageGrayscalePort; semaphore: Semaphore };

export class ImageGrayscaleWithSemaphoreAdapter implements ImageGrayscalePort {
  constructor(private readonly deps: Dependencies) {}

  async grayscale(recipe: ImageGrayscaleStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.grayscale(recipe));
  }
}
