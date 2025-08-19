import { describe, expect, test } from "bun:test";
import { VisitorIdHash } from "../src/visitor-id-hash.adapter";

describe("VisitorIdHash", () => {
  test("works", async () => {
    expect(await new VisitorIdHash("127.0.0.1", "sth").get()).toEqual("1424d48d3302e004");
  });
});
