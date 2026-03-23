import type { StandardSchemaV1 } from "@standard-schema/spec";

export const ReactiveConfigError = { NoAsyncSchema: "reactive.config.no.async.schema" };

export type ReactiveConfigSchema<T extends object> = StandardSchemaV1<unknown, T>;

export interface ReactiveConfigPort<T extends object> {
  get(): Promise<Readonly<T>>;
}
