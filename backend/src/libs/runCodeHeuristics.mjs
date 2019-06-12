import useUppercaseInCustomModules from 'heuristics/useUppercaseInCustomModules'
import checkRouteLengths from 'heuristics/checkRouteLengths'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

const dirname = path.resolve(new URL(import.meta.url).pathname, '..')

export default async function runCodeHeuristics() {
  console.log(chalk.gray('Running heuristics...'))

  await checkRouteLengths()
  await useUppercaseInCustomModules()

  console.log(chalk.gray('Heuristics done'))
}
