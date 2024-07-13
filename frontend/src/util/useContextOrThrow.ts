import { Context, useContext } from "react";

export default function useContextOrThrow<T>(contextType: Context<T>) {
  const value = useContext<T>(contextType);
  if (value == null) throw Error("Missing context");
  return value;
}
