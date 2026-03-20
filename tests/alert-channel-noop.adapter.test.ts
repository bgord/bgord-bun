import { describe, expect, test } from "bun:test";
import { AlertChannelNoopAdapter } from "../src/alert-channel-noop.adapter";
import * as mocks from "./mocks";

const adapter = new AlertChannelNoopAdapter();

describe("AlertChannelNoopAdapter", () => {
  test("send", async () => {
    await adapter.send(mocks.alert);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
