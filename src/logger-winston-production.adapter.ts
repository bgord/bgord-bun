import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";
import * as tools from "@bgord/tools";
import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";
import type { RedactorPort } from "./redactor.port";

type LoggerWinstonProductionAdapterConfigType = {
  app: LogAppType;
  AXIOM_API_TOKEN: string;
  redactor: RedactorPort;
};

export class LoggerWinstonProductionAdapter {
  readonly prodLogFile: string;

  constructor(private readonly config: LoggerWinstonProductionAdapterConfigType) {
    this.prodLogFile = this.createProdLogFile();
  }

  create(level: LogLevelEnum): LoggerPort {
    const file = new winston.transports.File({
      filename: this.prodLogFile,
      maxsize: tools.Size.fromMB(100).toBytes(),
      maxFiles: 3,
      tailable: true,
    });

    const axiom = new AxiomTransport({ token: this.config.AXIOM_API_TOKEN, dataset: this.config.app });

    return new LoggerWinstonAdapter({
      app: this.config.app,
      environment: NodeEnvironmentEnum.production,
      level,
      transports: [file, axiom],
      redactor: this.config.redactor,
    });
  }

  private createProdLogFile() {
    return `/var/log/${this.config.app}-${NodeEnvironmentEnum.production}.log`;
  }
}
