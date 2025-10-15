import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { Hono } from "hono";
import { Slower } from "../src/slower.middleware";

describe("Slower middleware", () => {
  test("happy path", async () => {
    const duration = tools.Duration.Seconds(3);
    const bunSleepSpy = spyOn(Bun, "sleep").mockImplementation(jest.fn());

    const app = new Hono().get("/slower", Slower.handle(duration), (c) => c.text("OK"));

    const response = await app.request("/slower");

    expect(await response.text()).toEqual("OK");
    expect(bunSleepSpy).toHaveBeenCalledWith(duration.ms);
  });
});
