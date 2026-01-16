export class EnvironmentFileParser {
  static parse(content: string): Record<string, string> {
    const result: Record<string, string> = {};

    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      // Stryker disable all
      const trimmed = line.trim();
      // Stryker restore all

      // Stryker disable all
      if (!trimmed) continue;
      // Stryker restore all

      if (trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();

      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      result[key] = value;
    }

    return result;
  }
}
