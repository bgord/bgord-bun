import { isPlainObject } from "./is-plain-object";

export function deepCloneWith<T>(
  value: T,
  replacer: (value: unknown, key?: string) => unknown,
  options: { allowRootReplace?: boolean } = {},
): T {
  const allowRootReplace = options.allowRootReplace ?? false;

  function clone(current: unknown, key?: string, isRoot = false): unknown {
    const replaced = replacer(current, key);

    if (replaced !== undefined && (!isRoot || allowRootReplace)) return replaced;

    if (Array.isArray(current)) return current.map((item) => clone(item));

    if (isPlainObject(current)) {
      const result: Record<string | symbol, unknown> = {};

      for (const ownKey of Reflect.ownKeys(current)) {
        const value = current[ownKey];
        result[ownKey] = clone(value, ownKey as string);
      }
      return result;
    }

    return current;
  }

  return clone(value, undefined, true) as T;
}
