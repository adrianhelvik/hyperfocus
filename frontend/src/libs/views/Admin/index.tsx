import { useEffect, useState } from "react";
import { UserStat } from "src/libs/types";
import styles from "./styles.module.css";
import Header from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import api from "src/libs/api";
import { createGlobalStyle } from "styled-components";

export default function AdminView() {
  const [stats, setUsers] = useState<UserStat[] | null>(null);

  useEffect(() => {
    api.getUserStats()
      .then((users) => setUsers(users));
  }, []);

  if (!stats) return "Loading...";

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
                <th>Role</th>
                <th>Board count</th>
                <th>Card count</th>
                <th>Verified email</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(stat => (
                <tr key={stat.userId}>
                  <td>{stat.email}</td>
                  <td>{stat.role}</td>
                  <td>{stat.boardCount}</td>
                  <td>{stat.cardCount}</td>
                  <td>{stat.verifiedEmail ? "Yes" : "No"}</td>
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
