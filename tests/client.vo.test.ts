import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";

describe("Client VO", () => {
  test("works", () => {
    const c = Client.from("1.1.1.1", "UA").toJSON();

    expect(c.ip).toBe("1.1.1.1");
    expect(c.ua).toBe("UA");
  });
});
