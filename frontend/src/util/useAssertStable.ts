import { useRef } from "react";

export default function useAssertStable<T>(value: T, name: string) {
  const ref = useRef<T>(value);

  if (ref.current !== value) {
    console.error("Value changed from", ref.current, "to", value);
    throw Error(`Expected "${name}" to be stable`);
  }
}
