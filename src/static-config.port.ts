export interface StaticConfigPort<T> {
  get(): Readonly<T>;
}
