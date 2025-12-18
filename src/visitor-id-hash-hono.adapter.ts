import type { Context } from "hono";
import { ClientFromHonoAdapter } from "./client-from-hono.adapter";
import type { ContentHashPort } from "./content-hash.port";
import type { VisitorIdPort } from "./visitor-id.port";
import { VisitorIdHashAdapter } from "./visitor-id-hash.adapter";

type Dependencies = { ContentHash: ContentHashPort };

export class VisitorIdHashHonoAdapter implements VisitorIdPort {
  private readonly delegate: VisitorIdHashAdapter;

  constructor(context: Context, deps: Dependencies) {
    this.delegate = new VisitorIdHashAdapter(ClientFromHonoAdapter.extract(context), deps);
  }

  async get() {
    return this.delegate.get();
  }
}
