import { describe, expect, test } from "bun:test";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { PrerequisiteSSLCertificateExpiry } from "../src/prerequisites/ssl-certificate-expiry";
import * as prereqs from "../src/prerequisites.service";

class CertificateInspectorUnavailableAdapter {
  async inspect() {
    return { success: false } as const;
  }
}

describe("prerequisites - ssl certificate expiry (port-based)", () => {
  test("passes when certificate has enough days remaining", async () => {
    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl",
      inspector: new CertificateInspectorNoopAdapter(100),
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.success());
  });

  test("fails when certificate expires too soon", async () => {
    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl",
      inspector: new CertificateInspectorNoopAdapter(10),
    });

    expect(await prerequisite.verify()).toEqual(
      prereqs.Verification.failure({ message: "10 days remaining" }),
    );
  });

  test("fails when certificate inspection is unavailable", async () => {
    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl",
      inspector: new CertificateInspectorUnavailableAdapter(),
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.failure({ message: "Unavailable" }));
  });

  test("returns undetermined if disabled", async () => {
    const prerequisite = new PrerequisiteSSLCertificateExpiry({
      host: "example.com",
      validDaysMinimum: 30,
      label: "ssl",
      enabled: false,
      inspector: new CertificateInspectorNoopAdapter(100),
    });

    expect(await prerequisite.verify()).toEqual(prereqs.Verification.undetermined());
  });
});
