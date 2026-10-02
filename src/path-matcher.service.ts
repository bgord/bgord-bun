export type PathMatcherRule = string | URLPattern;

export class PathMatcher {
  static matches(rules: ReadonlyArray<PathMatcherRule> | undefined, path: string): boolean {
    return rules?.some((rule) => PathMatcher.matchesRule(rule, path)) ?? false;
  }

  private static matchesRule(rule: PathMatcherRule, path: string): boolean {
    if (rule instanceof URLPattern) return rule.test({ pathname: path });
    if (path === rule) return true;

    return path.startsWith(rule.endsWith("/") ? rule : `${rule}/`);
  }
}
