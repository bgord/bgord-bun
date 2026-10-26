import { describe, expect, spyOn, test } from "bun:test";
import { WebPageFetcherBareAdapter } from "../src/web-page-fetcher-bare.adapter";
import * as mocks from "./mocks";

const json = { hello: "world" };

describe("WebPageFetcherBareAdapter", () => {
  test("happy path", async () => {
    const adapter = new WebPageFetcherBareAdapter();
    using _ = spyOn(global, "fetch").mockResolvedValue(Response.json(json));

    const response = await adapter.fetch(mocks.hostname);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual(json);
  });

  test("happy path - headers", async () => {
    const adapter = new WebPageFetcherBareAdapter();
    using fetch = spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 304 }));

    const response = await adapter.fetch(mocks.hostname, { headers: { "if-none-match": "etag" } });

    expect(response.status).toEqual(304);
    expect(fetch).toHaveBeenCalledWith(mocks.hostname, { headers: { "if-none-match": "etag" } });
  });
});
