import type { Client } from "./client.vo";
import type { VisitorIdPort } from "./visitor-id.port";

export class VisitorIdHash implements VisitorIdPort {
  constructor(private readonly client: Client) {}

  async get() {
    const { ip, ua } = this.client.toJSON();

    const prepared = `${ip}|${ua}`;
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(prepared));

    return Array.from(new Uint8Array(buffer))
      .slice(0, 8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
