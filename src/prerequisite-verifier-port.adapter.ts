import net from "node:net";
import type { PortType } from "./port.vo";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierPortAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { port: PortType }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(this.config.port, () =>
        server.close(() => resolve(prereqs.PrerequisiteVerification.success)),
      );
      server.on("error", () => resolve(prereqs.PrerequisiteVerification.failure()));
    });
  }

  get kind() {
    return "port";
  }
}
