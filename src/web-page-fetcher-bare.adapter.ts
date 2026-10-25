import type { WebPageFetcherPort } from "./web-page-fetcher.port";

export class WebPageFetcherBareAdapter implements WebPageFetcherPort {
  async fetch(url: string, signal?: AbortSignal): Promise<Response> {
    return fetch(url, { signal });
  }
}
