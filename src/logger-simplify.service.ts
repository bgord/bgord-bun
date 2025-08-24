export class LogSimplifier {
  static simplify(input: unknown): any {
    const boxed = { value: input };

    const json = JSON.stringify(boxed, (_key, value) =>
      Array.isArray(value) ? { type: "Array", length: value.length } : value,
    );

    return (JSON.parse(json) as { value: any }).value;
  }
}
