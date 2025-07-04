import type { Policy } from "./policy.service";

type BasePolicyType = Policy<any>;

type PolicyMessageType = BasePolicyType["message"];
type PolicyCodeType = BasePolicyType["code"];

type ErrorResponseTupleType = [{ message: PolicyMessageType; _known: true }, PolicyCodeType];

export class PolicyErrorHandler {
  error: BasePolicyType | undefined = undefined;

  constructor(private readonly policies: BasePolicyType[]) {}

  detect(error: unknown) {
    this.error = this.policies.find((policy) => error instanceof policy.error);
    return this;
  }

  static respond(error: BasePolicyType): ErrorResponseTupleType {
    return [{ message: error.message, _known: true }, error.code];
  }
}
