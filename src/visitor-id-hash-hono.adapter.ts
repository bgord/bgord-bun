import type { Context } from "hono";
import { ClientFromHonoAdapter } from "./client-from-hono.adapter";
import type { VisitorIdPort } from "./visitor-id.port";
import { VisitorId } from "./visitor-id.vo";
import { VisitorIdHashAdapter } from "./visitor-id-hash.adapter";

export class VisitorIdHashHonoAdapter implements VisitorIdPort {
  private readonly delegate: VisitorIdHashAdapter;

  constructor(context: Context) {
    this.delegate = new VisitorIdHashAdapter(ClientFromHonoAdapter.extract(context));
  }

  async get() {
    return VisitorId.parse(await this.delegate.get());
  }
}
