export { };

declare global {
  interface ObjectConstructor {
    keys<T>(object: T): Array<keyof T>;
  }

  interface NumberConstructor {
    isInteger(value: unknown): value is number;
  }
}
