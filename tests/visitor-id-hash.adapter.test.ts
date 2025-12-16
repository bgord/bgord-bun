import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";
import { VisitorId } from "../src/visitor-id.vo";
import { VisitorIdHashAdapter } from "../src/visitor-id-hash.adapter";

describe("VisitorIdHashAdapter", () => {
  test("happy path", async () => {
    expect(await new VisitorIdHashAdapter(Client.from("127.0.0.1", "sth")).get()).toEqual(
      VisitorId.parse("1424d48d3302e004"),
    );
  });
});
