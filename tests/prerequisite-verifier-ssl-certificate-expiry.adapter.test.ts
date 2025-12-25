import { describe, expect, test } from "bun:test";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { PrerequisiteVerifierSSLCertificateExpiryAdapter } from "../src/prerequisite-verifier-ssl-certificate-expiry.adapter";
import * as mocks from "./mocks";

class CertificateInspectorUnavailableAdapter {
  async inspect() {
    return { success: false } as const;
  }
}

const config = { hostname: "example.com", days: 30, label: "ssl" };

const deps = { CertificateInspector: new CertificateInspectorNoopAdapter(100) };

describe("PrerequisiteVerifierSSLCertificateExpiryAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, deps);

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - certificate expires too soon", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, {
      CertificateInspector: new CertificateInspectorNoopAdapter(10),
    });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure({ message: "10 days remaining" }));
  });

  test("failure - certificate unavailable", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, {
      CertificateInspector: new CertificateInspectorUnavailableAdapter(),
    });

    expect(await prerequisite.verify()).toEqual(
      mocks.VerificationFailure({ message: "Certificate unavailable" }),
    );
  });
});
