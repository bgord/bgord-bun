import { describe, expect, spyOn, test } from "bun:test";
import { Client } from "../src/client.vo";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { VisitorIdClientStrategy } from "../src/visitor-id-client.strategy";
import * as mocks from "./mocks";

const HashContent = new HashContentSha256BunStrategy();
const deps = { HashContent };

describe("VisitorIdClientStrategy", () => {
  test("get", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(mocks.ip, mocks.ua), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`${mocks.ip}|${mocks.ua}`);
  });

  test("get - missing ip", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(undefined, mocks.ua), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`anon|${mocks.ua}`);
  });

  test("get - missing ua", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(mocks.ip, undefined), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`${mocks.ip}|anon`);
  });

  test.only("get - missing", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(undefined, undefined), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith("anon|anon");
  });
});
