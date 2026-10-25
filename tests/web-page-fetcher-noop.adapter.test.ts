import { describe, expect, test } from "bun:test";
import * as mocks from "./mocks";
import { WebPageFetcherNoopAdapter } from "../src/web-page-fetcher-noop.adapter";

const json = { hello: "world" };

describe("WebPageFetcherNoopAdapter", () => {
  test("fetch", async () => {
    const adapter = new WebPageFetcherNoopAdapter(Response.json(json));

    const response = await adapter.fetch(mocks.hostname);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual(json);
  });
});
