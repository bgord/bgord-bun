import { describe, expect, test } from "bun:test";
import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import { WebPageFetcherNoopAdapter } from "../src/web-page-fetcher-noop.adapter";
import { WebPageFetcherWithTimeoutAdapter } from "../src/web-page-fetcher-with-timeout.adapter";
import * as mocks from "./mocks";

const config = { timeout: tools.Duration.Ms(10) };
const json = { hello: "world" };

const TimeoutCancellableRunner = new bg.TimeoutCancellableRunnerBare();

describe("WebPageFetcherWithTimeoutAdapter", () => {
  test("fetch", async () => {
    const adapter = new WebPageFetcherWithTimeoutAdapter(config, {
      TimeoutCancellableRunner,
      inner: new WebPageFetcherNoopAdapter(Response.json(json)),
    });
    const response = await adapter.fetch(mocks.hostname);

    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual(json);
  });

  test("fetch - timeout", async () => {
    const adapter = new WebPageFetcherWithTimeoutAdapter(config, {
      TimeoutCancellableRunner,
      inner: new WebPageFetcherNoopAdapter(new Response(new ReadableStream())),
    });

    await expect(() => adapter.fetch(mocks.hostname)).toThrow("timeout.cancellable.exceeded");
  });
});
