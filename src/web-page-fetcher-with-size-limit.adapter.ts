import type * as tools from "@bgord/tools";
import { WebPageFetcherError, type WebPageFetcherPort } from "./web-page-fetcher.port";

export type WebPageFetcherWithSizeLimitAdapterDependencies = { inner: WebPageFetcherPort };
export type WebPageFetcherWithSizeLimitAdapterConfig = { max: tools.Size };

export class WebPageFetcherWithSizeLimitAdapter implements WebPageFetcherPort {
  constructor(
    private readonly config: WebPageFetcherWithSizeLimitAdapterConfig,
    private readonly deps: WebPageFetcherWithSizeLimitAdapterDependencies,
  ) {}

  async fetch(url: string, signal?: AbortSignal): Promise<Response> {
    const response = await this.deps.inner.fetch(url, signal);
    const max = this.config.max.toBytes();

    if (Number(response.headers.get("content-length")) > max) throw new Error(WebPageFetcherError.TooLarge);

    if (!response.body) return response;

    let total = 0;

    const body = response.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          total += chunk.byteLength;

          if (total > max) return controller.error(new Error(WebPageFetcherError.TooLarge));

          controller.enqueue(chunk);
        },
      }),
    );

    return new Response(body, { status: response.status, headers: response.headers });
  }
}
