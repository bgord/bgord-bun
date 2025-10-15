import { describe, expect, test } from "bun:test";
import { Client } from "../src/client.vo";

describe("Client VO", () => {
  test("happy path", () => {
    const client = Client.from("1.1.1.1", "UA").toJSON();

    expect(client.ip).toEqual("1.1.1.1");
    expect(client.ua).toEqual("UA");
  });
});
