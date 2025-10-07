import tls from "node:tls";
import * as tools from "@bgord/tools";
import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";
import type { ClockPort } from "./clock.port";

type Dependencies = { Clock: ClockPort };

export class CertificateInspectorTLSAdapter implements CertificateInspectorPort {
  private static readonly ROUNDING = new tools.RoundToNearest();

  constructor(private readonly deps: Dependencies) {}

  async inspect(hostname: string): Promise<CertificateInspection> {
    return new Promise((resolve) => {
      const settle = (value: CertificateInspection) => {
        try {
          socket.end();
          socket.destroy();
        } finally {
          resolve(value);
        }
      };

      const socket = tls.connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          const certificate = socket.getPeerCertificate();
          if (!certificate?.valid_to) return settle({ success: false });

          const validToMs = new Date(certificate.valid_to).getTime();
          const daysRemaining = tools.Duration.Ms(validToMs - this.deps.Clock.nowMs()).days;

          settle({
            success: true,
            daysRemaining: CertificateInspectorTLSAdapter.ROUNDING.round(daysRemaining),
          });
        },
      );

      socket.once("error", () => settle({ success: false }));
    });
  }
}
