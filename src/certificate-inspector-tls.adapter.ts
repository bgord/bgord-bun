import tls from "node:tls";
import * as tools from "@bgord/tools";
import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";
import type { ClockPort } from "./clock.port";
import type { HostnameType } from "./hostname.vo";

type Dependencies = { Clock: ClockPort };

export class CertificateInspectorTLSAdapter implements CertificateInspectorPort {
  constructor(private readonly deps: Dependencies) {}

  async inspect(hostname: HostnameType): Promise<CertificateInspection> {
    return new Promise((resolve) => {
      const settle = (result: CertificateInspection) => {
        // Stryker disable all
        socket.destroy();
        // Stryker restore all
        resolve(result);
      };

      const socket = tls.connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          try {
            const certificate = socket.getPeerCertificate();

            // Stryker disable next-line ConditionalExpression
            if (!certificate.valid_to) return settle({ success: false });

            // biome-ignore lint: lint/style/noRestrictedGlobals
            const remaining = tools.Timestamp.fromNumber(new Date(certificate.valid_to).getTime()).difference(
              this.deps.Clock.now(),
            );

            settle({ success: true, remaining });
          } catch {
            settle({ success: false });
          }
        },
      );

      // Stryker disable all
      socket.once("error", () => settle({ success: false }));
      // Stryker restore all
    });
  }
}
