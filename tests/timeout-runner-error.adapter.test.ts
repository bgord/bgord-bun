import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { TimeoutError } from "../src/timeout-runner.port";
import { TimeoutRunnerErrorAdapter } from "../src/timeout-runner-error.adapter";

const action = async () => 2;
const timeout = tools.Duration.Seconds(5);
const adapter = new TimeoutRunnerErrorAdapter();

describe("TimeoutRunnerErrorAdapter", () => {
  test("run", async () => {
    expect(async () => adapter.run(action(), timeout)).toThrow(TimeoutError.Exceeded);
  });
});
