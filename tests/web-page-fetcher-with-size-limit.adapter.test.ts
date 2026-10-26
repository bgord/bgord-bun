import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { WebPageFetcherNoopAdapter } from "../src/web-page-fetcher-noop.adapter";
import { WebPageFetcherWithSizeLimitAdapter } from "../src/web-page-fetcher-with-size-limit.adapter";
import * as mocks from "./mocks";

const config = { max: tools.Size.fromBytes(4) };

describe("WebPageFetcherWithSizeLimitAdapter", () => {
  test("fetch", async () => {
    const json = {};
    const adapter = new WebPageFetcherWithSizeLimitAdapter(config, {
      inner: new WebPageFetcherNoopAdapter(Response.json(json)),
    });

    const response = await adapter.fetch(mocks.hostname);

    expect(await response.json()).toEqual(json);
  });

  test("fetch - content length", async () => {
    const response = Response.json("abcde", { headers: { "content-length": "5" } });
    const adapter = new WebPageFetcherWithSizeLimitAdapter(config, {
      inner: new WebPageFetcherNoopAdapter(response),
    });

    expect(async () => adapter.fetch(mocks.hostname)).toThrow("web.page.fetcher.too.large");
  });

  test("fetch - body too large", async () => {
    const blob = new Response(new Blob(["abcde"]).stream());
    const adapter = new WebPageFetcherWithSizeLimitAdapter(config, {
      inner: new WebPageFetcherNoopAdapter(blob),
    });

    const response = await adapter.fetch(mocks.hostname);

    expect(async () => response.text()).toThrow("web.page.fetcher.too.large");
  });

  test("fetch - headers", async () => {
    const inner = new WebPageFetcherNoopAdapter(new Response(null, { status: 304 }));
    const adapter = new WebPageFetcherWithSizeLimitAdapter(config, { inner });
    using fetch = spyOn(inner, "fetch");

    const response = await adapter.fetch(mocks.hostname, { headers: { "if-none-match": "etag" } });

    expect(response.status).toEqual(304);
    expect(fetch).toHaveBeenCalledWith(mocks.hostname, { headers: { "if-none-match": "etag" } });
  });
});
