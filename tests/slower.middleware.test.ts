import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { SlowerMiddleware } from "../src/slower.middleware";

const duration = tools.Duration.Seconds(3);
const Sleeper = new SleeperNoopAdapter();
const deps = { Sleeper };

describe("SlowerMiddleware", () => {
  test("happy path", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    const middleware = new SlowerMiddleware(duration, deps);

    await middleware.evaluate();

    expect(sleeperWait).toHaveBeenCalledWith(duration);
  });
});
