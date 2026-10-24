import { StandardSchemaValidator } from "../../../standard-schema-validator.service";
import type { UserIdType } from "../../auth/value-objects/user-id";
import type * as Ports from "../ports";
import type * as VO from "../value-objects";

export interface PreferencePort<D extends VO.PreferenceDefinitionType> {
  get(userId: UserIdType): Promise<VO.PreferenceValueType<D>>;
}

export class PreferenceAdapter<D extends VO.PreferenceDefinitionType> implements PreferencePort<D> {
  constructor(
    private readonly definition: VO.PreferenceDefinitionValidType<D>,
    private readonly reader: Ports.PreferenceReaderPort<D["key"]>,
  ) {}

  async get(userId: UserIdType): Promise<VO.PreferenceValueType<D>> {
    const stored = await this.reader.get(userId, this.definition.key);

    if (stored === null) return this.definition.default;
    return StandardSchemaValidator.validate(this.definition.schema, stored);
  }
}
