import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type { MailerPort } from "../mailer.port";
import * as prereqs from "../prerequisites.service";
import { Timeout } from "../timeout.service";

export class PrerequisiteMailer implements prereqs.Prerequisite {
  readonly kind = "mailer";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly mailer: MailerPort;
  readonly timeout: tools.Duration;

  constructor(config: prereqs.PrerequisiteConfigType & { mailer: MailerPort; timeout?: tools.Duration }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.mailer = config.mailer;
    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      await Timeout.run(this.mailer.verify(), this.timeout);
      return prereqs.Verification.success(stopwatch.stop());
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
