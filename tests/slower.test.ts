import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { Slower } from "../src/slower.middleware";

describe("Slower", () => {
  test("responds with Cache-Hit: miss on first uncached request", async () => {
    const time = tools.Time.Seconds(3);

    const bunSleep = spyOn(Bun, "sleep").mockResolvedValue();

    const app = new Hono();

    app.get("/slower", Slower.handle(time), (c) => c.text("OK"));

    const response = await app.request("/slower");
    expect(await response.text()).toEqual("OK");
    expect(bunSleep).toHaveBeenCalledWith(time.ms);

    bunSleep.mockRestore();
  });
});
