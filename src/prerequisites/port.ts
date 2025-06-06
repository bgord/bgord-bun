import net from "node:net";

import type { PortType } from "../port";
import * as prereqs from "../prerequisites";

type PrerequisitePortConfigType = {
  port: PortType;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisitePort extends prereqs.AbstractPrerequisite<PrerequisitePortConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.port;

  constructor(readonly config: PrerequisitePortConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(this.config.port, () =>
        server.close(() => {
          this.pass();
          return resolve(prereqs.PrerequisiteStatusEnum.success);
        }),
      );

      server.on("error", () => {
        this.reject();
        return resolve(prereqs.PrerequisiteStatusEnum.failure);
      });
    });
  }
}
