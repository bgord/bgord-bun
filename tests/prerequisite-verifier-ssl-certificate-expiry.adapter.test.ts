import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { PrerequisiteVerification } from "../src/prerequisite-verifier.port";
import { PrerequisiteVerifierSSLCertificateExpiryAdapter } from "../src/prerequisite-verifier-ssl-certificate-expiry.adapter";

class CertificateInspectorUnavailableAdapter {
  async inspect() {
    return { success: false } as const;
  }
}

const config = { hostname: "example.com", minimum: tools.Duration.Days(30) };

const deps = { CertificateInspector: new CertificateInspectorNoopAdapter(tools.Duration.Days(100)) };

describe("PrerequisiteVerifierSSLCertificateExpiryAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, deps);

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.success);
  });

  test("failure - certificate expires too soon", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, {
      CertificateInspector: new CertificateInspectorNoopAdapter(tools.Duration.Days(10)),
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("10 days remaining"));
  });

  test("failure - certificate unavailable", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, {
      CertificateInspector: new CertificateInspectorUnavailableAdapter(),
    });

    expect(await prerequisite.verify()).toEqual(PrerequisiteVerification.failure("Certificate unavailable"));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, deps);

    expect(prerequisite.kind).toEqual("ssl-certificate-expiry");
  });
});
