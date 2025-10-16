import type { Context } from "hono";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { VisitorIdPort } from "./visitor-id.port";
import { VisitorIdHashAdapter } from "./visitor-id-hash.adapter";

export class VisitorIdHashHonoAdapter implements VisitorIdPort {
  private readonly delegate: VisitorIdHashAdapter;

  constructor(context: Context) {
    this.delegate = new VisitorIdHashAdapter(ClientFromHono.extract(context));
  }

  async get() {
    return this.delegate.get();
  }
}
