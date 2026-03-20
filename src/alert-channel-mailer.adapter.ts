import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export type AlertChannelMailerAdapterConfig = { template: (alert: AlertMessage) => MailerTemplate };
export type AlertChannelMailerAdapterDependencies = { Mailer: MailerPort };

export class AlertChannelMailerAdapter implements AlertChannelPort {
  constructor(
    private readonly config: AlertChannelMailerAdapterConfig,
    private readonly deps: AlertChannelMailerAdapterDependencies,
  ) {}

  async send(alert: AlertMessage): Promise<void> {
    await this.deps.Mailer.send(this.config.template(alert));
  }

  async verify(): Promise<boolean> {
    return this.deps.Mailer.verify();
  }
}
