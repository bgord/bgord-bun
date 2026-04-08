import { describe, expect, spyOn, test } from "bun:test";
import tls from "node:tls";
import * as tools from "@bgord/tools";
import { CertificateInspectorTLSAdapter } from "../src/certificate-inspector-tls.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };

const adapter = new CertificateInspectorTLSAdapter(deps);

const host = "example.com";

const month = tools.Temporal.Instant.fromEpochMilliseconds(Clock.now().ms)
  .toZonedDateTimeISO("UTC")
  .add({ days: 30 }).epochMilliseconds;

const twoDaysAgo = tools.Temporal.Instant.fromEpochMilliseconds(Clock.now().ms)
  .toZonedDateTimeISO("UTC")
  .add({ days: -2 }).epochMilliseconds;

describe("CertificateInspectorTLSAdapter", () => {
  test("success - remaining 30 days", async () => {
    using tlsConnect = spyOn(tls, "connect").mockImplementation((_: any, onSecure: any) => {
      const socket: any = {
        once() {
          return this;
        },
        getPeerCertificate() {
          // biome-ignore lint: lint/style/noRestrictedGlobals
          return { valid_to: new Date(month).toUTCString().replace("UTC", "GMT") };
        },
        end() {},
        destroy() {},
      };
      queueMicrotask(onSecure);
      return socket;
    });

    expect(await adapter.inspect(host)).toEqual({
      success: true,
      remaining: tools.Duration.Days(30),
    });
    expect(tlsConnect).toHaveBeenCalledWith(
      { host, port: 443, rejectUnauthorized: false, servername: host },
      expect.any(Function),
    );
  });

  test("success - expired 2 days ago", async () => {
    using tlsConnect = spyOn(tls, "connect").mockImplementation((_: any, onSecure: any) => {
      const socket: any = {
        once() {
          return this;
        },
        getPeerCertificate() {
          // biome-ignore lint: lint/style/noRestrictedGlobals
          return { valid_to: new Date(twoDaysAgo).toUTCString().replace("UTC", "GMT") };
        },
        end() {},
        destroy() {},
      };
      queueMicrotask(onSecure);
      return socket;
    });

    expect(await adapter.inspect(host)).toEqual({
      success: true,
      remaining: tools.Duration.Days(-2),
    });
    expect(tlsConnect).toHaveBeenCalledWith(
      { host, port: 443, rejectUnauthorized: false, servername: host },
      expect.any(Function),
    );
  });

  test("failure - connection error", async () => {
    using tlsConnect = spyOn(tls, "connect").mockImplementation((_opts: any, _onSecure: any) => {
      let onError: any;
      const socket: any = {
        once(_event: string, handler: any) {
          onError = handler;
          return this;
        },
        getPeerCertificate() {
          return undefined;
        },
        end() {},
        destroy() {},
      };
      queueMicrotask(() => onError?.(new Error(mocks.IntentionalError)));
      return socket;
    });

    expect(await adapter.inspect(host)).toEqual({ success: false });
    expect(tlsConnect).toHaveBeenCalledWith(
      { host, port: 443, rejectUnauthorized: false, servername: host },
      expect.any(Function),
    );
  });

  test("failure - missing certificate", async () => {
    using tlsConnect = spyOn(tls, "connect").mockImplementation((_: any, onSecure: any) => {
      const socket: any = {
        once() {
          return this;
        },
        getPeerCertificate() {
          return undefined;
        },
        end() {},
        destroy() {},
      };
      queueMicrotask(onSecure);
      return socket;
    });

    expect(await adapter.inspect(host)).toEqual({ success: false });
    expect(tlsConnect).toHaveBeenCalledWith(
      { host, port: 443, rejectUnauthorized: false, servername: host },
      expect.any(Function),
    );
  });
});
