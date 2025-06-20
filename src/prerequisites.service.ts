export type PrerequisiteLabelType = string;

export enum PrerequisiteStrategyEnum {
  binary = "binary",
  mailer = "mailer",
  self = "self",
  timezoneUTC = "timezoneUTC",
  path = "path",
  node = "node",
  bun = "bun",
  RAM = "RAM",
  space = "space",
  translations = "translations",
  port = "port",
  jobs = "jobs",
  memory = "memory",
  outsideConnectivity = "outsideConnectivity",
  sslCertificateExpiry = "sslCertificateExpiry",
  logFile = "logFile",
  dependencyVulnerabilities = "dependencyVulnerabilities",
  externalApi = "externalApi",
  /** @public */
  custom = "custom",
}

export enum PrerequisiteStatusEnum {
  success = "success",
  failure = "failure",
  undetermined = "undetermined",
}

export type BasePrerequisiteConfig = {
  label: PrerequisiteLabelType;
  enabled?: boolean;
} & Record<string, unknown>;

export abstract class AbstractPrerequisite<T extends BasePrerequisiteConfig> {
  readonly label: PrerequisiteLabelType;
  readonly enabled: boolean = true;
  abstract readonly strategy: PrerequisiteStrategyEnum;
  abstract readonly config: T;

  status: PrerequisiteStatusEnum = PrerequisiteStatusEnum.undetermined;

  constructor(config: T) {
    this.label = config.label;
    this.enabled = config.enabled ?? true;
  }

  abstract verify(): Promise<PrerequisiteStatusEnum>;

  pass(): PrerequisiteStatusEnum.success {
    this.status = PrerequisiteStatusEnum.success;
    return PrerequisiteStatusEnum.success;
  }

  reject(): PrerequisiteStatusEnum.failure {
    this.status = PrerequisiteStatusEnum.failure;
    return PrerequisiteStatusEnum.failure;
  }

  report() {
    if (this.status === PrerequisiteStatusEnum.success) {
      console.log(`[x] ${this.config.label} verified correctly with ${this.strategy} strategy`);
    }

    if (this.status === PrerequisiteStatusEnum.failure) {
      console.log(`[-] ${this.config.label} not verified correctly with ${this.strategy} strategy`);
    }

    if (this.status === PrerequisiteStatusEnum.undetermined) {
      console.log(`[?] ${this.config.label} not enabled with ${this.strategy} strategy`);
    }
  }
}

/** @public */
export class Prerequisites {
  static async check(prerequisites: AbstractPrerequisite<BasePrerequisiteConfig>[]) {
    try {
      const failedPrerequisiteLabels: PrerequisiteLabelType[] = [];

      for (const prerequisite of prerequisites) {
        await prerequisite.verify();
        prerequisite.report();

        if (prerequisite.status === PrerequisiteStatusEnum.failure) {
          failedPrerequisiteLabels.push(prerequisite.label);
        }
      }

      if (failedPrerequisiteLabels.length > 0) {
        const failedPrerequisiteLabelsFormatted = failedPrerequisiteLabels.join(", ");

        console.log(`Prerequisites failed: ${failedPrerequisiteLabelsFormatted}, quitting...`);

        process.exit(1);
      }
    } catch (error) {
      console.log("Prerequisites error", String(error));
    }
  }
}
