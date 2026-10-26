export const WebPageFetcherError = { TooLarge: "web.page.fetcher.too.large" };

export type WebPageFetcherOptions = { signal?: AbortSignal; headers?: HeadersInit };

export interface WebPageFetcherPort {
  fetch(url: string, options?: WebPageFetcherOptions): Promise<Response>;
}
