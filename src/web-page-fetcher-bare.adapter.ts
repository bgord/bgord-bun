import type { WebPageFetcherOptions, WebPageFetcherPort } from "./web-page-fetcher.port";

export class WebPageFetcherBareAdapter implements WebPageFetcherPort {
  async fetch(url: string, options?: WebPageFetcherOptions): Promise<Response> {
    return fetch(url, options);
  }
}
