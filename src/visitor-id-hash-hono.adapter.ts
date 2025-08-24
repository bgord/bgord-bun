import type { Context } from "hono";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { VisitorIdPort } from "./visitor-id.port";
import { VisitorIdHash } from "./visitor-id-hash.adapter";

export class VisitorIdHashHono implements VisitorIdPort {
  private readonly delegate: VisitorIdHash;

  constructor(context: Context) {
    const client = ClientFromHono.extract(context);

    this.delegate = new VisitorIdHash(client);
  }

  async get() {
    return this.delegate.get();
  }
}
