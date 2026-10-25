import type { WebPageFetcherPort } from "./web-page-fetcher.port";

export class WebPageFetcherNoopAdapter implements WebPageFetcherPort {
  constructor(private readonly response: Response) {}

  async fetch(_url: string, _signal?: AbortSignal): Promise<Response> {
    return this.response;
  }
}
