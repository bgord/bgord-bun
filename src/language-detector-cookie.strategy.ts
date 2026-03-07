import type * as tools from "@bgord/tools";
import type { LanguageDetectorStrategy } from "./language-detector.strategy";
import type { Languages } from "./languages.vo";
import type { HasRequestCookie } from "./request-context.port";

export class LanguageDetectorCookieStrategy<T extends tools.LanguageType>
  implements LanguageDetectorStrategy<T>
{
  constructor(private readonly name: string) {}

  detect(context: HasRequestCookie, languages: Languages<T>): T | null {
    const detected = context.request.cookie(this.name);

    return languages.isSupported(detected) ? detected : null;
  }
}
