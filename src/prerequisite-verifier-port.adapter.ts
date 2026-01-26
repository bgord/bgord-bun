import net from "node:net";
import type { PortType } from "./port.vo";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierPortAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { port: PortType }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(this.config.port, () => server.close(() => resolve(PrerequisiteVerification.success)));
      server.on("error", () =>
        resolve(PrerequisiteVerification.failure(`${this.config.port} port occupied`)),
      );
    });
  }

  get kind(): string {
    return "port";
  }
}
