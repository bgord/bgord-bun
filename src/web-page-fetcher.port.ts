export const WebPageFetcherError = { TooLarge: "web.page.fetcher.too.large" };

export interface WebPageFetcherPort {
  fetch(url: string, signal?: AbortSignal): Promise<Response>;
}
