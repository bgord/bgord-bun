import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { ContentHashSha256BunAdapter } from "../src/content-hash-sha256-bun.adapter";
import { Hash } from "../src/hash.vo";
import { VisitorIdHashAdapter } from "../src/visitor-id-hash.adapter";

const ContentHash = new ContentHashSha256BunAdapter();
const deps = { ContentHash };

describe("VisitorIdHashAdapter", () => {
  test("happy path", async () => {
    const adapter = new VisitorIdHashAdapter(Client.from("127.0.0.1", "sth"), deps);

    const result = await adapter.get();

    expect(
      result.matches(Hash.fromString("1424d48d3302e004e2f3ff5f02ba545ececac64c9d7c9dda05326c383c7f3081")),
    ).toEqual(true);
  });
});
