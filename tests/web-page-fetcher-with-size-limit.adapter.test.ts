import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as mocks from "./mocks";
import { WebPageFetcherWithSizeLimitAdapter } from "../src/web-page-fetcher-with-size-limit.adapter";
import { WebPageFetcherNoopAdapter } from "../src/web-page-fetcher-noop.adapter";

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
});
