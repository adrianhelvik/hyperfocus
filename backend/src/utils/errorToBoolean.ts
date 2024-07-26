export default function errorToBoolean(value: unknown): Promise<boolean> {
  if (
    typeof value === "object"
    && value && "then" in value
    && typeof value.then === "function"
  ) {
    try {
      return value.then(
        () => true,
        () => false,
      );
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  if (typeof value === "function") {
    try {
      value();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  throw Error("Expected a Promise-like or a function");
}
