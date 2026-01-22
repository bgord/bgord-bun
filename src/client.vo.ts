import { ClientIp, type ClientIpType } from "./client-ip.vo";
import { ClientUserAgent, type ClientUserAgentType } from "./client-user-agent.vo";

export class Client {
  private constructor(
    private readonly ip?: ClientIpType,
    private readonly ua?: ClientUserAgentType,
  ) {}

  static fromParts(ip: string | undefined, ua: string | undefined): Client {
    const parsedIp = ClientIp.safeParse(ip);
    const parsedUa = ClientUserAgent.safeParse(ua);

    return new Client(parsedIp.data, parsedUa.data);
  }

  static fromSafeParts(ip: ClientIpType | undefined, ua: ClientUserAgentType | undefined): Client {
    return new Client(ip, ua);
  }

  equals(other: Client): boolean {
    return this.ip === other.ip && this.ua === other.ua;
  }

  hasSameUa(other: Client): boolean {
    return this.ua !== undefined && this.ua === other.ua;
  }

  hasSameIp(other: Client): boolean {
    return this.ip !== undefined && this.ip === other.ip;
  }

  toJSON(): { ip?: ClientIpType; ua?: ClientUserAgentType } {
    return { ip: this.ip, ua: this.ua };
  }
}
