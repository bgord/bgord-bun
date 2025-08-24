import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";
import * as tools from "@bgord/tools";
import * as winston from "winston";
import type { LogAppType, LoggerPort, LogLevelEnum } from "./logger.port";
import { LoggerWinstonAdapter } from "./logger-winston.adapter";
import { NodeEnvironmentEnum } from "./node-env.vo";

export class LoggerWinstonProductionAdapter {
  readonly prodLogFile: string;

  constructor(
    private readonly app: LogAppType,
    private readonly AXIOM_API_TOKEN: string,
  ) {
    this.prodLogFile = this.createProdLogFile();
  }

  create(level: LogLevelEnum): LoggerPort {
    const file = new winston.transports.File({
      filename: `/var/log/${this.app}-${NodeEnvironmentEnum.production}.log`,
      maxsize: tools.Size.toBytes({ unit: tools.SizeUnit.MB, value: 100 }),
      maxFiles: 3,
      tailable: true,
    });

    const axiom = new AxiomTransport({ token: this.AXIOM_API_TOKEN, dataset: this.app });

    return new LoggerWinstonAdapter({
      app: this.app,
      environment: NodeEnvironmentEnum.production,
      level,
      transports: [file, axiom],
    });
  }

  private createProdLogFile() {
    return `/var/log/${this.app}-${NodeEnvironmentEnum.production}.log`;
  }
}
