import net from "node:net";
import type { PortType } from "../port.vo";
import * as prereqs from "../prerequisites.service";

export class PrerequisitePort implements prereqs.Prerequisite {
  readonly kind = "port";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly port: PortType;

  constructor(config: prereqs.PrerequisiteConfigType & { port: PortType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.port = config.port;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(this.port, () => server.close(() => resolve(prereqs.Verification.success())));
      server.on("error", () => resolve(prereqs.Verification.failure()));
    });
  }
}
