import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";

describe("Client VO", () => {
  test("works", () => {
    const client = Client.from("1.1.1.1", "UA").toJSON();

    expect(client.ip).toBe("1.1.1.1");
    expect(client.ua).toBe("UA");
  });
});
