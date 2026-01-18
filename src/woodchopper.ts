import type { LoggerAppType, LogLevelEnum } from "./logger.port";
import type { NodeEnvironmentEnum } from "./node-env.vo";

export type WoodchopperConfigType = {
  app: LoggerAppType;
  level: LogLevelEnum;
  environment: NodeEnvironmentEnum;
};

export class Woodchopper {
  constructor(private readonly config: WoodchopperConfigType) {}
}
