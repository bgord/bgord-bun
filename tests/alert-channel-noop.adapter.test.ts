import { describe, expect, test } from "bun:test";
import { AlertChannelNoopAdapter } from "../src/alert-channel-noop.adapter";
import * as testcase from "./testcases";

const cases = testcase.alertChannel();

const adapter = new AlertChannelNoopAdapter();

describe("AlertChannelNoopAdapter", () => {
  test(cases.send.name, async () => {
    expect(async () => adapter.send(cases.send.input)).not.toThrow();
  });

  test(cases.verify.name, async () => {
    expect(await adapter.verify()).toEqual(cases.verify.output);
  });
});
