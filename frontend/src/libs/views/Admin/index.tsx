import { useEffect, useState } from "react";
import { UserStat } from "src/libs/types";
import styles from "./styles.module.css";
import Header from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import api from "src/libs/api";
import { createGlobalStyle } from "styled-components";

export default function AdminView() {
  const [users, setUsers] = useState<UserStat[] | null>(null);

  useEffect(() => {
    api.getUserStats()
      .then((users) => setUsers(users));
  }, []);

  if (!users) return "Loading...";

  return (
    <>
      <GlobalStyle />
      <Header />
      <div
        className={styles.container}
        style={{ "--base-color": theme.baseColor } as any}
      >
        <h1 className={styles.h1}>User stats</h1>
        <section className={styles.box}>
          <table className={styles.table} cellSpacing={0}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Board count</th>
                <th>Card count</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userId}>
                  <td>{user.email}</td>
                  <td>{user.boardCount}</td>
                  <td>{user.cardCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  )
}

const GlobalStyle = createGlobalStyle`
  body {
    background: ${theme.smoothGradient};
  }
`;
