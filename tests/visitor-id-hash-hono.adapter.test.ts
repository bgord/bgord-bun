import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { VisitorIdHashHono } from "../src/visitor-id-hash-hono.adapter";

const ip = { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } };

describe("VisitorIdHashHono adapter", () => {
  test("works", async () => {
    const app = new Hono().get("/id", async (context) =>
      context.text(await new VisitorIdHashHono(context).get()),
    );

    const result = await app.request("/id", { method: "GET" }, ip);

    expect(await result.text()).toEqual("cbc46a7ff4f622ab");
  });
});
