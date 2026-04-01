import type { AntivirusPort } from "./antivirus.port";
import {
  AntivirusWithLoggerAdapter,
  type AntivirusWithLoggerAdapterDependencies,
} from "./antivirus-with-logger.adapter";
import {
  AntivirusWithSemaphoreAdapter,
  type AntivirusWithSemaphoreAdapterDependencies,
} from "./antivirus-with-semaphore.adapter";
import {
  AntivirusWithTimeoutAdapter,
  type AntivirusWithTimeoutAdapterConfig,
  type AntivirusWithTimeoutAdapterDependencies,
} from "./antivirus-with-timeout.adapter";

export class AntivirusBuilder {
  constructor(private readonly inner: AntivirusPort) {}

  static of(antivirus: AntivirusPort): AntivirusBuilder {
    return new AntivirusBuilder(antivirus);
  }

  withLogger(deps: Omit<AntivirusWithLoggerAdapterDependencies, "inner">) {
    return AntivirusBuilder.of(new AntivirusWithLoggerAdapter({ ...deps, inner: this.inner }));
  }

  withTimeout(
    config: AntivirusWithTimeoutAdapterConfig,
    deps: Omit<AntivirusWithTimeoutAdapterDependencies, "inner">,
  ) {
    return AntivirusBuilder.of(new AntivirusWithTimeoutAdapter(config, { ...deps, inner: this.inner }));
  }

  withSemaphore(deps: Omit<AntivirusWithSemaphoreAdapterDependencies, "inner">) {
    return AntivirusBuilder.of(new AntivirusWithSemaphoreAdapter({ ...deps, inner: this.inner }));
  }

  build() {
    return this.inner;
  }
}
