import { ClientUserAgent, type ClientUserAgentType } from "./client-user-agent.vo";

type ClientIpType = string;
export type ClientType = { ip: ClientIpType; ua: ClientUserAgentType };

export class Client {
  private constructor(private readonly value: ClientType) {}

  static fromPartsSafe(
    ip: ClientIpType | null | undefined,
    ua: ClientUserAgentType | null | undefined,
  ): Client {
    return new Client({ ip: ip ?? "anon", ua: ClientUserAgent.parse((ua ?? "anon").toLowerCase()) });
  }

  static fromParts(ip: string | null | undefined, ua: string | null | undefined): Client {
    return new Client({ ip: ip ?? "anon", ua: ClientUserAgent.parse((ua ?? "anon").toLowerCase()) });
  }

  equals(another: Client): boolean {
    return this.value.ip === another.value.ip && this.value.ua === another.value.ua;
  }

  matchesUa(ua: ClientUserAgentType): boolean {
    return this.value.ua.includes(ua.toLowerCase());
  }

  matchesIp(ip: ClientIpType): boolean {
    return this.value.ip.includes(ip.toLowerCase());
  }

  get ip(): ClientIpType {
    return this.value.ip;
  }

  get ua(): ClientUserAgentType {
    return this.value.ua;
  }

  toJSON(): ClientType {
    return this.value;
  }
}
