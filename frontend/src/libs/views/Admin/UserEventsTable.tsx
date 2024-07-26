import styles from "./styles.module.css";
import * as dateFns from "date-fns";
import { Toggle } from "./Toggle";
import { useEffect, useState } from "react";
import formatMicroseconds from "src/util/formatMicroseconds";

type Severity = "ERROR" | "WARNING" | "INFO";

export default function UserEventsTable() {
  const [events, setEvents] = useState<any[]>([]);
  const [flags, setFlags] = useState<{ severity: Severity[] }>({ severity: ["ERROR", "WARNING"] })

  const severityEnabled = (severity: Severity) => flags.severity.includes(severity);

  const toggleSeverity = (severity: Severity) => {
    setFlags(flags => ({
      ...flags,
      severity: flags.severity.includes(severity)
        ? flags.severity.filter(it => it !== severity)
        : flags.severity.concat(severity),
    }))
  }

  useEffect(() => {
    const onEvent = (event: any) => {
      setEvents(events => {
        return [event, ...events];
      });
    };

    for (const severity of flags.severity) {
      SOCKET_IO.on(`userEvent:${severity}`, onEvent);
    }

    return () => {
      for (const severity of flags.severity) {
        SOCKET_IO.off(`userEvent:${severity}`, onEvent);
      }
    };
  }, [flags.severity])

  return (
    <section className={styles.section}>
      <div className={`${styles.flex} ${styles.h1Margin}`}>
        <h1 className={styles.h1}>User events</h1>
        <div className={styles.severityToggles}>
          <Toggle
            color={severityColor("ERROR")}
            onToggle={() => toggleSeverity("ERROR")}
            value={severityEnabled("ERROR")}
          >
            Error
          </Toggle>
          <Toggle
            color={severityColor("WARNING")}
            onToggle={() => toggleSeverity("WARNING")}
            value={severityEnabled("WARNING")}
          >
            Warning
          </Toggle>
          <Toggle
            color={severityColor("INFO")}
            onToggle={() => toggleSeverity("INFO")}
            value={severityEnabled("INFO")}
          >
            Info
          </Toggle>
        </div>
      </div>
      <table className={styles.table} cellSpacing={0}>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Event name</th>
            <th>Timestamp</th>
            <th>Info</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {events.map(event => (
            <tr key={event.eventId}>
              <td>
                <span
                  className={styles.severity}
                  data-severity={event.severity}
                  style={{
                    "--severity-color": severityColor(event.severity),
                  } as any}
                >
                  {event.severity}
                </span>
              </td>
              <td>{event.name}</td>
              <td>{dateFns.format(event.timestamp, "yyyy-MM-dd HH:SS")}</td>
              <td>{event.info}</td>
              <td>{formatMicroseconds(event.duration)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function severityColor(severity: Severity): string {
  switch (severity) {
    case "ERROR": return "red";
    case "INFO": return "#2f98d9";
    case "WARNING": return "orange";
  }
}
