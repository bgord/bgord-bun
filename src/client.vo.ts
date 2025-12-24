export type ClientIpType = string;
export type ClientUaType = string;
export type ClientType = { ip: ClientIpType; ua: ClientUaType };

export class Client {
  private constructor(private readonly value: ClientType) {}

  static fromParts(ip: ClientIpType | null | undefined, ua: ClientUaType | null | undefined): Client {
    return new Client({ ip: ip ?? "anon", ua: (ua ?? "anon").toLowerCase() });
  }

  equals(another: Client): boolean {
    return this.value.ip === another.value.ip && this.value.ua === another.value.ua;
  }

  matchesUa(ua: ClientUaType): boolean {
    return this.value.ua.includes(ua.toLowerCase());
  }

  matchesIp(ip: ClientIpType): boolean {
    return this.value.ip.includes(ip.toLowerCase());
  }

  get ip(): ClientIpType {
    return this.value.ip;
  }

  get ua(): ClientUaType {
    return this.value.ua;
  }

  toJSON(): ClientType {
    return this.value;
  }
}
