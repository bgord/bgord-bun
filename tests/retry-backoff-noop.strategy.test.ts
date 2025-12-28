import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";

const backoff = new RetryBackoffNoopStrategy();

describe("RetryBackoffNoopStrategy", () => {
  test("next", () => {
    expect(backoff.next().equals(tools.Duration.Ms(0))).toEqual(true);
  });
});
