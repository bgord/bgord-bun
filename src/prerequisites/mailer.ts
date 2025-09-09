import type { MailerPort } from "../mailer.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteMailer implements prereqs.Prerequisite {
  readonly kind = "mailer";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly mailer: MailerPort;

  constructor(config: prereqs.PrerequisiteConfigType & { mailer: MailerPort }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.mailer = config.mailer;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      await this.mailer.verify();

      return prereqs.Verification.success();
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
