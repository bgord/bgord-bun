import type * as tools from "@bgord/tools";
import type { ImageProcessorPort, ImageProcessorStrategy } from "./image-processor.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageProcessorPort; semaphore: Semaphore };

export class ImageProcessorWithSemaphoreAdapter implements ImageProcessorPort {
  constructor(private readonly deps: Dependencies) {}

  async process(recipe: ImageProcessorStrategy): Promise<tools.FilePathRelative | tools.FilePathAbsolute> {
    return this.deps.semaphore.run(() => this.deps.inner.process(recipe));
  }
}
