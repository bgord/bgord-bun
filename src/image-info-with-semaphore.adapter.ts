import type * as tools from "@bgord/tools";
import type { ImageInfoPort, ImageInfoType } from "./image-info.port";
import type { Semaphore } from "./semaphore.service";

type Dependencies = { inner: ImageInfoPort; semaphore: Semaphore };

export class ImageInfoWithSemaphoreAdapter implements ImageInfoPort {
  constructor(private readonly deps: Dependencies) {}

  async inspect(input: tools.FilePathRelative | tools.FilePathAbsolute): Promise<ImageInfoType> {
    return this.deps.semaphore.run(() => this.deps.inner.inspect(input));
  }
}
