import type { PayloadSerializerPort } from "./payload-serializer.port";

export class PayloadSerializerJsonAdapter implements PayloadSerializerPort {
  serialize(payload: Record<string, unknown>): string {
    return JSON.stringify(payload);
  }

  deserialize(raw: string): Record<string, unknown> {
    return JSON.parse(raw);
  }
}
