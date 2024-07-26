import chalk from "chalk";
import { randomUUID } from "crypto";

export type Severity = "INFO" | "WARNING" | "ERROR";

export default function emitUservent(name: string, severity: Severity, info: string, duration: number) {
  console.log(chalk.gray(`userEvent: ${name} ${severity} ${info}`))
  io.to("admin").emit(`userEvent:${severity}`, {
    eventId: randomUUID(),
    name,
    timestamp: Date.now(),
    severity,
    info,
    duration,
  })
}
