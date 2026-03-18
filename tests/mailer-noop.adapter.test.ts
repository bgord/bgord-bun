import { describe, expect, test } from "bun:test";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import * as mocks from "./mocks";

const mailer = new MailerNoopAdapter();

describe("MailerNoopAdapter", () => {
  test("send - success", async () => {
    expect(async () => mailer.send(mocks.template)).not.toThrow();
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
