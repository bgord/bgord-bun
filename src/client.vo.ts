export type ClientIpType = string;
export type ClientUaType = string;

export type ClientType = { ip: ClientIpType; ua: ClientUaType };

export class Client {
  private constructor(private readonly value: ClientType) {}

  static from(ip: ClientIpType | null | undefined, ua: ClientUaType | null | undefined): Client {
    return new Client({ ip: ip ?? "anon", ua: ua ?? "anon" });
  }

  toJSON(): ClientType {
    return this.value;
  }
}
