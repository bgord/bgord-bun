import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { VisitorIdHash } from "../src/visitor-id-hash.adapter";

describe("VisitorIdHash", () => {
  test("works", async () => {
    const client = Client.from("127.0.0.1", "sth");
    const visitorId = new VisitorIdHash(client);

    expect(await visitorId.get()).toEqual("1424d48d3302e004");
  });
});
