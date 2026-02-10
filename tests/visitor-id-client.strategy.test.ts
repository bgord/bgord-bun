import { describe, expect, spyOn, test } from "bun:test";
import { Client } from "../src/client.vo";
import { HashContentSha256Strategy } from "../src/hash-content-sha256.strategy";
import { VisitorIdClientStrategy } from "../src/visitor-id-client.strategy";
import * as mocks from "./mocks";

const HashContent = new HashContentSha256Strategy();
const deps = { HashContent };

describe("VisitorIdClientStrategy", () => {
  test("get", async () => {
    using hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(mocks.client, deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`${mocks.ip}|${mocks.ua}`);
  });

  test("get - missing ip", async () => {
    using hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(undefined, mocks.ua), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`anon|${mocks.ua}`);
  });

  test("get - missing ua", async () => {
    using hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(mocks.ip, undefined), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`${mocks.ip}|anon`);
  });

  test("get - missing", async () => {
    using hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(mocks.clientEmpty, deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith("anon|anon");
  });
});
