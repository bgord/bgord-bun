import type { EnvironmentLoaderPort, EnvironmentResultType } from "./environment-loader.port";

type Config<T extends object> = { inner: EnvironmentLoaderPort<T> };

export class EnvironmentLoaderWithMemoAdapter<T extends object> implements EnvironmentLoaderPort<T> {
  private memoized: Promise<Readonly<EnvironmentResultType<T>>> | null = null;

  constructor(private readonly config: Config<T>) {}

  async load(): Promise<Readonly<EnvironmentResultType<T>>> {
    if (this.memoized === null) {
      this.memoized = this.config.inner.load().catch((error) => {
        this.memoized = null;

        throw error;
      });
    }

    return this.memoized;
  }
}
