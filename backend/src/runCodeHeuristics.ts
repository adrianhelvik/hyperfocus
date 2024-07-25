import checkRouteLengths from "./heuristics/checkRouteLengths";
import chalk from "chalk";

export default async function runCodeHeuristics() {
  console.log(chalk.gray("Running heuristics..."));

  await checkRouteLengths();

  console.log(chalk.gray("Heuristics done"));
}
