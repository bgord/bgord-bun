import net from "node:net";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
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

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(this.port, () =>
        server.close(() => resolve(prereqs.Verification.success(stopwatch.stop()))),
      );
      server.on("error", () => resolve(prereqs.Verification.failure(stopwatch.stop())));
    });
  }
}
