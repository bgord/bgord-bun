import * as v from "valibot";
import { ClientIp, type ClientIpType } from "./client-ip.vo";
import { ClientUserAgent, type ClientUserAgentType } from "./client-user-agent.vo";

export class Client {
  private constructor(
    readonly ip?: ClientIpType,
    readonly ua?: ClientUserAgentType,
  ) {}

  static fromParts(ip: string | undefined, ua: string | undefined): Client {
    const parsedIp = v.safeParse(ClientIp, ip);
    const parsedUa = v.safeParse(ClientUserAgent, ua);

    if (parsedIp.success && parsedUa.success) return new Client(parsedIp.output, parsedUa.output);
    if (parsedIp.success && !parsedUa.success) return new Client(parsedIp.output, undefined);
    if (!parsedIp.success && parsedUa.success) return new Client(undefined, parsedUa.output);
    return new Client(undefined, undefined);
  }

  static fromSafeParts(ip: ClientIpType | undefined, ua: ClientUserAgentType | undefined): Client {
    return new Client(ip, ua);
  }

  equals(other: Client): boolean {
    return this.ip !== undefined && this.ua !== undefined && this.ip === other.ip && this.ua === other.ua;
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
