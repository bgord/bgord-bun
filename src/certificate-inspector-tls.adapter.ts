import tls from "node:tls";
import * as tools from "@bgord/tools";
import type { CertificateInspection, CertificateInspectorPort } from "./certificate-inspector.port";
import type { ClockPort } from "./clock.port";

type Dependencies = { Clock: ClockPort };

export class CertificateInspectorTLSAdapter implements CertificateInspectorPort {
  constructor(private readonly deps: Dependencies) {}

  async inspect(hostname: string): Promise<CertificateInspection> {
    return new Promise((resolve) => {
      // Stryker disable all
      const cleanup = (socket: tls.TLSSocket) => socket.destroy();
      // Stryker restore all

      const socket = tls.connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          const certificate = socket.getPeerCertificate();

          if (!certificate?.valid_to) {
            cleanup(socket);
            return resolve({ success: false });
          }

          const remaining = tools.Timestamp.fromDateLike(certificate.valid_to).difference(
            this.deps.Clock.now(),
          );

          cleanup(socket);
          resolve({ success: true, remaining });
        },
      );

      // Stryker disable all
      socket.once("error", () => {
        // Stryker restore all
        cleanup(socket);
        resolve({ success: false });
      });
    });
  }
}
