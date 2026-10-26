import type * as bg from "@bgord/bun";
import type * as tools from "@bgord/tools";
import type { WebPageFetcherOptions, WebPageFetcherPort } from "./web-page-fetcher.port";

export type WebPageFetcherWithTimeoutAdapterDependencies = {
  TimeoutCancellableRunner: bg.TimeoutCancellableRunnerPort;
  inner: WebPageFetcherPort;
};
export type WebPageFetcherWithTimeoutAdapterConfig = { timeout: tools.Duration };

export class WebPageFetcherWithTimeoutAdapter implements WebPageFetcherPort {
  constructor(
    private readonly config: WebPageFetcherWithTimeoutAdapterConfig,
    private readonly deps: WebPageFetcherWithTimeoutAdapterDependencies,
  ) {}

  async fetch(url: string, options?: WebPageFetcherOptions): Promise<Response> {
    return this.deps.TimeoutCancellableRunner.cancellable(async (signal) => {
      const response = await this.deps.inner.fetch(url, { ...options, signal });

      return new Response(await response.arrayBuffer(), {
        status: response.status,
        headers: response.headers,
      });
    }, this.config.timeout);
  }
}
