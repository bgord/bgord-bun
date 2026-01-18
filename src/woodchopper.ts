import type { ClockPort } from "./clock.port";
import type { LoggerAppType, LogLevelEnum } from "./logger.port";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export type WoodchopperConfigType = {
  app: LoggerAppType;
  level: LogLevelEnum;
  environment: NodeEnvironmentEnum;
};

type Dependencies = { Clock: ClockPort };

export class Woodchopper {
  constructor(
    private readonly config: WoodchopperConfigType,
    private readonly deps: Dependencies,
  ) {}
}
