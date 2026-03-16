import { describe, expect, test } from "bun:test";
import * as v from "valibot";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import { NonceValue } from "../src/nonce-value.vo";
import { SSRService } from "../src/ssr.service";

const zeros = v.parse(NonceValue, "0000000000000000");

describe("SSRService", () => {
  test("secure", () => {
    const NonceProvider = new NonceProviderDeterministicAdapter([zeros]);
    const service = new SSRService({ NonceProvider });

    expect(service.secure(zeros)).toEqual({
      "Content-Security-Policy": `default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'nonce-${zeros}'; script-src-elem 'self' 'nonce-${zeros}'; style-src 'self' 'nonce-${zeros}'; style-src-attr 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'`,
      "Permissions-Policy":
        "accelerometer=(), autoplay=(), camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "no-referrer",
      "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-DNS-Prefetch-Control": "off",
      "X-Download-Options": "noopen",
      "X-Permitted-Cross-Domain-Policies": "none",
      "X-XSS-Protection": "0",
    });
  });
});
