import type { StandardSchemaV1 } from "@standard-schema/spec";

export type PreferenceDefinitionType = {
  readonly key: string;
  readonly field: string;
  readonly schema: StandardSchemaV1<unknown, string>;
  readonly default: string | null;
};

export type PreferenceDefinitionValidType<D extends PreferenceDefinitionType> =
  D["default"] extends StandardSchemaV1.InferOutput<D["schema"]> | null ? D : never;

export type PreferenceValueType<D extends PreferenceDefinitionType> =
  | StandardSchemaV1.InferOutput<D["schema"]>
  | D["default"];
