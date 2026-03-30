import type { PayloadSerializerPort } from "./payload-serializer.port";

export class PayloadSerializerCollectingAdapter implements PayloadSerializerPort {
  readonly serialized: Array<Record<string, unknown>> = [];

  readonly deserialized: Array<string> = [];

  serialize(payload: Record<string, unknown>): string {
    this.serialized.push(payload);

    return JSON.stringify(payload);
  }

  deserialize(raw: string): Record<string, unknown> {
    this.deserialized.push(raw);

    return JSON.parse(raw);
  }
}
