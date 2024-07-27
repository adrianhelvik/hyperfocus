import { useLayoutEffect } from "react";
import AppRoutes from "./AppRoutes";
import { baseColor } from "./libs/theme";

export default function App() {
  useLayoutEffect(() => {
    const prev = document.body.style.getPropertyValue("--base-color");
    document.body.style.setProperty("--base-color", baseColor);
    return () => {
      document.body.style.setProperty("--base-color", prev);
    }
  }, []);

  return <AppRoutes />;
}
