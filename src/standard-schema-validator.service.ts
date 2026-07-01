import type { StandardSchemaV1 } from "@standard-schema/spec";

const StandardSchemaValidatorError = {
  NoAsyncSchema: "standard.schema.validate.error.no.async.schema",
};

export class StandardSchemaValidator {
  static validate<Output>(schema: StandardSchemaV1<unknown, Output>, raw: unknown): Output {
    const result = schema["~standard"].validate(raw);

    if (result instanceof Promise) throw new Error(StandardSchemaValidatorError.NoAsyncSchema);
    if (result.issues) throw new Error(result.issues[0]?.message);
    return result.value;
  }
}
