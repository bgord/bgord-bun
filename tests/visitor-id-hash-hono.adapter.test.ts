import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { ContentHashSha256BunAdapter } from "../src/content-hash-sha256-bun.adapter";
import { Hash } from "../src/hash.vo";
import { VisitorIdHashHonoAdapter } from "../src/visitor-id-hash-hono.adapter";

const ip = { server: { requestIP: () => ({ address: "127.0.0.1", family: "foo", port: "123" }) } };
const ContentHash = new ContentHashSha256BunAdapter();
const deps = { ContentHash };

describe("VisitorIdHashHonoAdapter", () => {
  test("works", async () => {
    const app = new Hono().get("/id", async (context) => {
      const adapter = new VisitorIdHashHonoAdapter(context, deps);
      const hash = await adapter.get();

      return context.text(hash.get());
    });

    const result = await app.request("/id", { method: "GET" }, ip);
    const hash = Hash.fromString(await result.text());

    expect(
      hash.matches(Hash.fromString("cbc46a7ff4f622abbcfe90e895993db309e4e32280fc1b6347b90be4b19270ca")),
    ).toEqual(true);
  });
});
