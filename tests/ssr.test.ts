import { describe, expect, test } from "bun:test";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import { NonceValue, type NonceValueType } from "../src/nonce-value.vo";
import { SSR } from "../src/ssr";

const zeros = NonceValue.parse("0000000000000000");
const ones = NonceValue.parse("1111111111111111");

describe("SSR", async () => {
  test("happy path", async () => {
    const NonceProvider = new NonceProviderDeterministicAdapter([zeros]);

    const handler = async (): Promise<Response> => new Response("ok");

    const fetch = SSR.essentials(handler, { NonceProvider });

    const response = await fetch(new Request("http://localhost/"));

    expect(response.headers.toJSON()).toEqual({
      "content-security-policy": `default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'nonce-${zeros}'; script-src-elem 'self' 'nonce-${zeros}'; style-src 'self' 'nonce-${zeros}'; style-src-attr 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'`,
      "permissions-policy":
        "accelerometer=(), autoplay=(), camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      "origin-agent-cluster": "?1",
      "referrer-policy": "no-referrer",
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-dns-prefetch-control": "off",
      "x-download-options": "noopen",
      "x-frame-options": "SAMEORIGIN",
      "x-permitted-cross-domain-policies": "none",
      "x-xss-protection": "0",
    });
  });

  test("failure", async () => {
    const NonceProvider = new NonceProviderDeterministicAdapter([zeros]);
    const deps = { NonceProvider };
    const fetch = SSR.essentials(async (): Promise<Response> => new Response("fail", { status: 500 }), deps);

    const response = await fetch(new Request("http://localhost/"));

    expect(response.status).toEqual(500);
    expect(response.headers.get("content-security-policy")).toContain(`'nonce-${zeros}'`);
  });

  test("different once per request", async () => {
    const NonceProvider = new NonceProviderDeterministicAdapter([zeros, ones]);
    const deps = { NonceProvider };
    const handler = async (_: Request, nonce: NonceValueType): Promise<Response> => new Response(nonce);
    const fetch = SSR.essentials(handler, deps);

    const first = await fetch(new Request("http://localhost/1"));
    const second = await fetch(new Request("http://localhost/2"));

    expect(await first.text()).toEqual(zeros);
    expect(await second.text()).toEqual(ones);
  });
});
