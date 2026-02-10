import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { Slower } from "../src/slower.middleware";

const duration = tools.Duration.Seconds(3);
const Sleeper = new SleeperNoopAdapter();
const deps = { Sleeper };

describe("Slower middleware", () => {
  test("happy path", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    const app = new Hono().get("/slower", Slower.handle(duration, deps), (c) => c.text("OK"));

    const response = await app.request("/slower");

    expect(await response.text()).toEqual("OK");
    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });
});
