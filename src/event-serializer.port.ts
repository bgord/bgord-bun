export interface EventSerializerPort {
  serialize(payload: unknown): string;
  deserialize(raw: string): unknown;
}
