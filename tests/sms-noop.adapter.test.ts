import { describe, expect, test } from "bun:test";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import * as mocks from "./mocks";

const adapter = new SmsNoopAdapter();

describe("SmsNoopAdapter", () => {
  test("send", async () => {
    expect(async () => adapter.send(mocks.sms)).not.toThrow();
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
