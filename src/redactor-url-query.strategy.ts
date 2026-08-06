import * as tools from "@bgord/tools";
import type { RedactorStrategy } from "./redactor.strategy";
import { RedactorMask } from "./redactor-mask.strategy";

export class RedactorUrlQuery implements RedactorStrategy {
  private readonly keys: Set<string>;

  constructor(keys?: ReadonlyArray<string>) {
    this.keys = new Set((keys?.length ? keys : RedactorMask.DEFAULT_KEYS).map((key) => key.toLowerCase()));
  }

  redact<T>(input: T): T {
    if (!tools.isPlainObject(input)) return input;
    if (typeof input["url"] !== "string") return input;

    return { ...input, url: this.mask(input["url"]) };
  }

  private mask(url: string): string {
    const [base, query] = url.split("?");

    if (!query) return url;

    const masked = new URLSearchParams(
      Array.from(new URLSearchParams(query), ([key, value]) => [
        key,
        this.keys.has(key.toLowerCase()) ? "***" : value,
      ]),
    );

    return `${base}?${masked.toString()}`;
  }
}
