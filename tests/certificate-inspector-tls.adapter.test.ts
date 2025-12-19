import { describe, expect, spyOn, test } from "bun:test";
import tls from "node:tls";
import * as tools from "@bgord/tools";
import { CertificateInspectorTLSAdapter } from "../src/certificate-inspector-tls.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { Clock };
const adapter = new CertificateInspectorTLSAdapter(deps);

describe("CertificateInspectorTLSAdapter", () => {
  test("success - remaining 30 days", async () => {
    const valid_to = new Date(Clock.now().add(tools.Duration.Days(30)).ms).toUTCString();
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

    expect(await adapter.inspect("example.com")).toEqual({ success: true, daysRemaining: 30 });
  });

  test("success - expired 2 days ago", async () => {
    const valid_to = new Date(Clock.now().add(tools.Duration.Days(-2)).ms).toUTCString();
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

    expect(await adapter.inspect("expired.example")).toEqual({ success: true, daysRemaining: -2 });
  });

  test("failre - connection error", async () => {
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
      queueMicrotask(() => onError?.(new Error(mocks.IntentionalError)));
      return socket;
    });

    expect(await adapter.inspect("nope.invalid")).toEqual({ success: false });
  });

  test("failure - missing certificate", async () => {
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

    expect(await adapter.inspect("nocert.example")).toEqual({ success: false });
  });
});
