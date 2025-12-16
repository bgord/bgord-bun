import { describe, expect, test } from "bun:test";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { PrerequisiteSSLCertificateExpiry } from "../src/prerequisites/ssl-certificate-expiry";
import * as mocks from "./mocks";

class CertificateInspectorUnavailableAdapter {
  async inspect() {
    return { success: false } as const;
  }
}

const config = { hostname: "example.com", days: 30, label: "ssl" };

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);
const deps = { CertificateInspector: new CertificateInspectorNoopAdapter(100) };

describe("PrerequisiteSSLCertificateExpiry", () => {
  test("success", async () => {
    expect(await new PrerequisiteSSLCertificateExpiry(config, deps).verify(Clock)).toEqual(
      mocks.VerificationSuccess,
    );
  });

  test("failure - certificate expires too soon", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry(config, {
        CertificateInspector: new CertificateInspectorNoopAdapter(10),
      }).verify(Clock),
    ).toEqual(mocks.VerificationFailure({ message: "10 days remaining" }));
  });

  test("failure - certificate unavailable", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry(config, {
        CertificateInspector: new CertificateInspectorUnavailableAdapter(),
      }).verify(Clock),
    ).toEqual(mocks.VerificationFailure({ message: "Certificate unavailable" }));
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry({ ...config, enabled: false }, deps).verify(Clock),
    ).toEqual(mocks.VerificationUndetermined);
  });
});
