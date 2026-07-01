import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ReactiveConfigSchema<T extends object> = StandardSchemaV1<unknown, T>;

export interface ReactiveConfigPort<T extends object> {
  get(): Promise<Readonly<T>>;
}
