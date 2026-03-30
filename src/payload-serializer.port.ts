export interface PayloadSerializerPort {
  serialize(payload: Record<string, unknown>): string;
  deserialize(raw: string): Record<string, unknown>;
}
