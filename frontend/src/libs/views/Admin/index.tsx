import useAdminKeyboardShortcuts from "./useAdminKeyboardShortcuts";
import { useAuthenticateOrRedirect } from "src/libs/authContext";
import { createGlobalStyle } from "styled-components";
import { getPersistentHeaders } from "src/libs/api";
import UserEventsTable from "./UserEventsTable";
import UserStatsTable from "./UserStatsTable";
import styles from "./styles.module.css";
import Header from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import { useEffect } from "react";

export default function AdminView() {
  useAuthenticateOrRedirect();
  useAdminKeyboardShortcuts();

  useEffect(() => {
    SOCKET_IO.emit("joinAdmin", getPersistentHeaders());
    return () => {
      SOCKET_IO.emit("leaveAdmin");
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <Header />
      <div
        className={styles.container}
        style={{ "--base-color": theme.baseColor } as any}
      >
        <UserStatsTable />
        <UserEventsTable />
      </div>
    </>
  )
}

const GlobalStyle = createGlobalStyle`
  body {
    background: ${theme.smoothGradient};
  }
`;
