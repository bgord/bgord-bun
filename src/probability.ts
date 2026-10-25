import * as v from "valibot";

export const ProbabilityError = { Type: "probability.type", Invalid: "probability.invalid" };

export const Probability = v.pipe(
  v.number(ProbabilityError.Type),
  v.minValue(0, ProbabilityError.Invalid),
  v.maxValue(1, ProbabilityError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("Probability"),
);
export type ProbabilityType = v.InferOutput<typeof Probability>;
