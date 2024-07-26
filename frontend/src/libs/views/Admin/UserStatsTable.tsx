import { useEffect, useState } from "react";
import { UserStat } from "src/libs/types";
import styles from "./styles.module.css";
import api from "src/libs/api";

export default function UserStatsTable() {
  const [stats, setUserStats] = useState<UserStat[] | null>(null);

  useEffect(() => {
    api.getUserStats()
      .then((users) => setUserStats(users));
  }, []);

  return (
    <section className={styles.section}>
      <h1 className={styles.h1}>User stats</h1>
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
          {stats && stats.map(stat => (
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
  );
}
