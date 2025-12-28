import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";

const action = async () => 2;
const timeout = tools.Duration.Seconds(5);
const adapter = new TimeoutRunnerNoopAdapter();

describe("TimeoutRunnerNoopAdapter", () => {
  test("run", async () => {
    expect(await adapter.run(action(), timeout)).toEqual(2);
  });
});
