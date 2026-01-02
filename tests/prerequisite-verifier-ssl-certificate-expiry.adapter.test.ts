import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { CertificateInspectorNoopAdapter } from "../src/certificate-inspector-noop.adapter";
import { PrerequisiteVerifierSSLCertificateExpiryAdapter } from "../src/prerequisite-verifier-ssl-certificate-expiry.adapter";
import * as mocks from "./mocks";

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

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure - certificate expires too soon", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, {
      CertificateInspector: new CertificateInspectorNoopAdapter(tools.Duration.Days(10)),
    });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "10 days remaining" }));
  });

  test("failure - certificate unavailable", async () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, {
      CertificateInspector: new CertificateInspectorUnavailableAdapter(),
    });

    const result = await prerequisite.verify();

    expect(result).toEqual(mocks.VerificationFailure({ message: "Certificate unavailable" }));
  });

  test("kind", () => {
    const prerequisite = new PrerequisiteVerifierSSLCertificateExpiryAdapter(config, deps);

    expect(prerequisite.kind).toEqual("ssl-certificate-expiry");
  });
});
