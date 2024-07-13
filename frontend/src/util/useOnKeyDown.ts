import { useAutoEffect } from "hooks.macro";

export default function useOnKeyDown(handler: (e: KeyboardEvent) => void) {
  useAutoEffect(() => {
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });
}
