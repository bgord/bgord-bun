// cspell:ignore noopen nosniff
import { describe, expect, test } from "bun:test";
import { NonceProviderDeterministicAdapter } from "../src/nonce-provider-deterministic.adapter";
import { SSRService } from "../src/ssr.service";
import { SsrCsp } from "../src/ssr-csp";
import * as mocks from "./mocks";

describe("SSRService", () => {
  test("secure - default", () => {
    const NonceProvider = new NonceProviderDeterministicAdapter([mocks.nonce]);
    const service = new SSRService({ NonceProvider });

    expect(service.secure(mocks.nonce)).toEqual({
      "Content-Security-Policy": `default-src 'none'; base-uri 'none'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; script-src 'self' 'nonce-${mocks.nonce}'; script-src-elem 'self' 'nonce-${mocks.nonce}'; style-src 'self' 'nonce-${mocks.nonce}'; style-src-attr 'unsafe-inline'; img-src 'self'; media-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'`,
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
  test("secure - hcaptcha", () => {
    const NonceProvider = new NonceProviderDeterministicAdapter([mocks.nonce]);
    const service = new SSRService({ NonceProvider }, { csp: SsrCsp.hcaptcha });

    expect(service.secure(mocks.nonce)).toEqual({
      "Content-Security-Policy": `default-src 'none'; base-uri 'none'; object-src 'none'; frame-src 'none' https://newassets.hcaptcha.com; frame-ancestors 'none'; script-src 'self' 'nonce-${mocks.nonce}' https://js.hcaptcha.com; script-src-elem 'self' 'nonce-${mocks.nonce}' https://js.hcaptcha.com; style-src 'self' 'nonce-${mocks.nonce}' https://newassets.hcaptcha.com; style-src-attr 'unsafe-inline'; img-src 'self' https://imgs.hcaptcha.com; media-src 'self'; font-src 'self'; connect-src 'self' https://api.hcaptcha.com; form-action 'self'`,
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
