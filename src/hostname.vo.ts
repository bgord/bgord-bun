import * as v from "valibot";

export const HostnameError = {
  Type: "hostname.type",
  Invalid: "hostname.invalid",
};

export const Hostname = v.pipe(
  v.string(HostnameError.Type),
  v.domain(HostnameError.Invalid),
  // Stryker disable next-line StringLiteral
  v.brand("Hostname"),
);

export type HostnameType = v.InferOutput<typeof Hostname>;
