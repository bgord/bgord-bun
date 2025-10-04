import type { Context } from "hono";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { VisitorIdPort } from "./visitor-id.port";
import { VisitorIdHash } from "./visitor-id-hash.adapter";

export class VisitorIdHashHono implements VisitorIdPort {
  private readonly delegate: VisitorIdHash;

  constructor(context: Context) {
    this.delegate = new VisitorIdHash(ClientFromHono.extract(context));
  }

  async get() {
    return this.delegate.get();
  }
}
