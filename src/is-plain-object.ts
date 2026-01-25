export function isPlainObject(value: unknown): value is Record<string | symbol, unknown> {
  if (!value) return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
