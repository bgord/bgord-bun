import { describe, expect, test } from "bun:test";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { PrerequisiteSSLCertificateExpiry } from "../src/prerequisites/ssl-certificate-expiry";
import * as prereqs from "../src/prerequisites.service";

class CertificateInspectorUnavailableAdapter {
  async inspect() {
    return { success: false } as const;
  }
}

const config = { host: "example.com", days: 30, label: "ssl" };

describe("PrerequisiteSSLCertificateExpiry", () => {
  test("success", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry({
        ...config,
        inspector: new CertificateInspectorNoopAdapter(100),
      }).verify(),
    ).toEqual(prereqs.Verification.success());
  });

  test("failure - certificate expires too soon", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry({
        ...config,
        inspector: new CertificateInspectorNoopAdapter(10),
      }).verify(),
    ).toEqual(prereqs.Verification.failure({ message: "10 days remaining" }));
  });

  test("failure - certificate unavailable", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry({
        ...config,
        inspector: new CertificateInspectorUnavailableAdapter(),
      }).verify(),
    ).toEqual(prereqs.Verification.failure({ message: "Certificate unavailable" }));
  });

  test("undetermined", async () => {
    expect(
      await new PrerequisiteSSLCertificateExpiry({
        ...config,
        enabled: false,
        inspector: new CertificateInspectorNoopAdapter(100),
      }).verify(),
    ).toEqual(prereqs.Verification.undetermined());
  });
});
