import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import isMac from "src/util/isMac";

export default function useAdminKeyboardShortcuts() {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      if (isMac) {
        if (e.ctrlKey && e.key.toLowerCase() === "a") {
          navigate("/app");
        }
      } else if (e.ctrlKey && e.key === "A") {
        navigate("/app");
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [navigate]);
}
