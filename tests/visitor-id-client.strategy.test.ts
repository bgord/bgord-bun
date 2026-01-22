import { describe, expect, spyOn, test } from "bun:test";
import { Client } from "../src/client.vo";
import { HashContentSha256BunStrategy } from "../src/hash-content-sha256-bun.strategy";
import { VisitorIdClientStrategy } from "../src/visitor-id-client.strategy";

const HashContent = new HashContentSha256BunStrategy();
const deps = { HashContent };

const ip = "127.0.0.1";
const ua = "firefox";

describe("VisitorIdClientStrategy", () => {
  test("get", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(ip, ua), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`${ip}|${ua}`);
  });

  test("get - missing ip", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(undefined, ua), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`anon|${ua}`);
  });

  test("get - missing ua", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(ip, undefined), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith(`${ip}|anon`);
  });

  test.only("get - missing", async () => {
    const hashContentGet = spyOn(HashContent, "hash");
    const adapter = new VisitorIdClientStrategy(Client.fromParts(undefined, undefined), deps);

    await adapter.get();

    expect(hashContentGet).toHaveBeenCalledWith("anon|anon");
  });
});
