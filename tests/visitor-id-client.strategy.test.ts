import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { Hash } from "../src/hash.vo";
import { HashContentSha256BunAdapter } from "../src/hash-content-sha256-bun.adapter";
import { VisitorIdClientStrategy } from "../src/visitor-id-client.strategy";

const HashContent = new HashContentSha256BunAdapter();
const deps = { HashContent };

describe("VisitorIdClientStrategy", () => {
  test("happy path", async () => {
    const adapter = new VisitorIdClientStrategy(Client.fromParts("127.0.0.1", "sth"), deps);

    const result = await adapter.get();

    expect(
      result.matches(Hash.fromString("1424d48d3302e004e2f3ff5f02ba545ececac64c9d7c9dda05326c383c7f3081")),
    ).toEqual(true);
  });
});
