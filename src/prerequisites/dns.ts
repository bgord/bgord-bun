import dns from "dns/promises";
import * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";
import { Timeout } from "../timeout.service";

export class PrerequisiteDNS implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly hostname: string;
  readonly timeout: tools.Duration;

  constructor(config: prereqs.PrerequisiteConfigType & { hostname: string; timeout?: tools.Duration }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.hostname = config.hostname;
    this.timeout = config.timeout ?? tools.Duration.Seconds(1);
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined();

    try {
      await Timeout.run(dns.lookup(this.hostname), this.timeout);

      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "dns";
  }
}
