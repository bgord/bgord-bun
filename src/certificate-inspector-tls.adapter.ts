import tls from "node:tls";
import * as tools from "@bgord/tools";
import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";
import type { ClockPort } from "./clock.port";

type Dependencies = { Clock: ClockPort };

export class CertificateInspectorTLSAdapter implements CertificateInspectorPort {
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

          const remaining = tools.Timestamp.fromDateLike(certificate.valid_to).difference(
            this.deps.Clock.now(),
          );

          settle({ success: true, remaining });
        },
      );

      socket.once("error", () => settle({ success: false }));
    });
  }
}
