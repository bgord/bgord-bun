import type { LoggerAppType } from "./logger.port";

export type WoodchopperConfigType = {
  app: LoggerAppType;
};

export class Woodchopper {
  constructor(private readonly config: WoodchopperConfigType) {}
}
