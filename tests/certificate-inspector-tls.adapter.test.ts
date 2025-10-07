import { describe, expect, spyOn, test } from "bun:test";
import tls from "node:tls";
import * as tools from "@bgord/tools";
import { CertificateInspectorTLSAdapter } from "../src/certificate-inspector-tls.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";

const NOW = tools.Timestamp.parse(Date.UTC(2025, 0, 1, 12, 0, 0));
const Clock = new ClockFixedAdapter(NOW);

describe("CertificateInspectorTLSAdapter (mocked tls, simplest)", () => {
  test("successful true and remaining 30 days", async () => {
    const valid_to = new Date(tools.Time.Now(Clock.nowMs()).Add(tools.Duration.Days(30))).toUTCString();

    spyOn(tls, "connect").mockImplementation((_: any, onSecure: any) => {
      const socket: any = {
        once() {
          return this;
        },
        getPeerCertificate() {
          return { valid_to };
        },
        end() {},
        destroy() {},
      };
      queueMicrotask(onSecure);
      return socket;
    });

    const adapter = new CertificateInspectorTLSAdapter({ Clock });

    expect(await adapter.inspect("example.com")).toEqual({ success: true, daysRemaining: 30 });
  });

  test("successful true and expired 2 days ago", async () => {
    const valid_to = new Date(tools.Time.Now(Clock.nowMs()).Add(tools.Duration.Days(-2))).toUTCString();

    spyOn(tls, "connect").mockImplementation((_: any, onSecure: any) => {
      const socket: any = {
        once() {
          return this;
        },
        getPeerCertificate() {
          return { valid_to };
        },
        end() {},
        destroy() {},
      };
      queueMicrotask(onSecure);
      return socket;
    });

    const adapter = new CertificateInspectorTLSAdapter({ Clock });

    expect(await adapter.inspect("expired.example")).toEqual({ success: true, daysRemaining: -2 });
  });

  test("connection error", async () => {
    spyOn(tls, "connect").mockImplementation((_opts: any, _onSecure: any) => {
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
      queueMicrotask(() => onError?.(new Error("Boom")));
      return socket;
    });

    const adapter = new CertificateInspectorTLSAdapter({ Clock });

    expect(await adapter.inspect("nope.invalid")).toEqual({ success: false });
  });

  test("connect succeeds but certificate is missing", async () => {
    spyOn(tls, "connect").mockImplementation((_: any, onSecure: any) => {
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

    const adapter = new CertificateInspectorTLSAdapter({ Clock });

    expect(await adapter.inspect("nocert.example")).toEqual({ success: false });
  });
});
