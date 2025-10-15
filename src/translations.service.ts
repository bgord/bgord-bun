import { createFactory } from "hono/factory";
import { I18n } from "./i18n.service";

const handler = createFactory();

export class Translations {
  static build = () =>
    handler.createHandlers(async (c) => {
      const language = c.get("language");
      const translations = await new I18n().getTranslations(language);

      return c.json({ translations, language });
    });
}
