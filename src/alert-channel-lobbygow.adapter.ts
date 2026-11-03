import type * as tools from "@bgord/tools";
import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";
import type { MailerTemplateMessage } from "./mailer-template.vo";

export const AlertChannelLobbygowAdapterError = { Rejected: "alert.channel.lobbygow.adapter.rejected" };

export type AlertChannelLobbygowAdapterConfig = {
  API_KEY: tools.ApiKeyType;
  message: (alert: AlertMessage) => MailerTemplateMessage;
};

export class AlertChannelLobbygowAdapter implements AlertChannelPort {
  static readonly NOTIFICATION_SEND_URL = "https://lobbygow.bgord.space/api/notification-send";
  static readonly LIVENESS_URL = "https://lobbygow.bgord.space/api/liveness";

  constructor(private readonly config: AlertChannelLobbygowAdapterConfig) {}

  async send(alert: AlertMessage): Promise<void> {
    const message = this.config.message(alert);

    const response = await fetch(AlertChannelLobbygowAdapter.NOTIFICATION_SEND_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": this.config.API_KEY },
      body: JSON.stringify({ kind: "error", subject: message.subject, content: message.html }),
    });

    if (!response.ok) throw new Error(AlertChannelLobbygowAdapterError.Rejected);
  }

  async verify(): Promise<boolean> {
    try {
      const response = await fetch(AlertChannelLobbygowAdapter.LIVENESS_URL);

      return response.ok;
    } catch {
      return false;
    }
  }
}
