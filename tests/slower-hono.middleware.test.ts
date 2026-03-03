import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { SlowerHonoMiddleware } from "../src/slower-hono.middleware";

const duration = tools.Duration.Seconds(3);
const Sleeper = new SleeperNoopAdapter();
const deps = { Sleeper };

describe("SlowerHonoMiddleware", () => {
  test("waits before calling next", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    const middleware = new SlowerHonoMiddleware(duration, deps);
    const app = new Hono().use(middleware.handle()).get("/slower", (c) => c.text("OK"));

    const response = await app.request("/slower");

    expect(await response.text()).toEqual("OK");
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });
});
