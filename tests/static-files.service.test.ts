import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import {
  StaticFileStrategyMustRevalidate,
  StaticFileStrategyNoop,
  StaticFiles,
} from "../src/static-files.service";

const FIXTURES_ROOT = "tests/fixtures";
const CSS = "http://localhost/public/main.css";
const HTML = "http://localhost/public/login.html";

const routes = StaticFiles.handle("/public/*", StaticFileStrategyNoop, { root: FIXTURES_ROOT });

describe("StaticFiles service", () => {
  test("static assets - transport and no csp", async () => {
    const response = await routes["/public/*"]?.(new Request(CSS));

    expect(response?.status).toEqual(200);
    expect(response?.headers.toJSON()).toEqual({
      "content-type": "text/css; charset=utf-8",
      "cross-origin-embedder-policy": "require-corp",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      etag: expect.any(String),
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

  test("html - transport and csp", async () => {
    const response = await routes["/public/*"]?.(new Request(HTML));

    expect(response?.headers.toJSON()).toEqual({
      "content-security-policy":
        "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; media-src 'self'; connect-src 'self'; form-action 'self'",
      "content-type": "text/html; charset=utf-8",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      etag: expect.any(String),
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

  test("strategy - must-revalidate", async () => {
    const duration = tools.Duration.Minutes(5);

    const routes = StaticFiles.handle("/public/*", StaticFileStrategyMustRevalidate(duration), {
      root: FIXTURES_ROOT,
    });

    const response = await routes["/public/*"]?.(new Request(CSS));

    expect(response?.headers.get("cache-control")).toEqual(
      `public, max-age=${duration.seconds}, must-revalidate`,
    );
  });

  test("gracefully handles missing files", async () => {
    const response = await routes["/public/*"]?.(new Request("http://localhost/public/does-not-exist.css"));

    expect(response?.status).toBe(404);
  });
});
