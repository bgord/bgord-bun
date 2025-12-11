import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";
import * as tools from "@bgord/tools";
import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorPort } from "./redactor.port";

type LoggerWinstonProductionAdapterConfigType = {
  app: LogAppType;
  AXIOM_API_TOKEN?: string;
  redactor: RedactorPort;
};

export class LoggerWinstonProductionAdapter {
  constructor(private readonly config: LoggerWinstonProductionAdapterConfigType) {}

  create(level: LogLevelEnum): LoggerPort {
    const filePath = tools.FilePathAbsolute.fromString(
      `/var/log/${this.config.app}-${NodeEnvironmentEnum.production}.log`,
    );

    const file = new winston.transports.File({
      filename: filePath.get(),
      maxsize: tools.Size.fromMB(100).toBytes(),
      maxFiles: 3,
      tailable: true,
    });

    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.production,
      level,
      transports: [
        file,
        this.config.AXIOM_API_TOKEN
          ? new AxiomTransport({ token: this.config.AXIOM_API_TOKEN, dataset: this.config.app })
          : undefined,
      ].filter((adapter) => adapter !== undefined),
      redactor: this.config.redactor,
      filePath,
    });
  }
}
