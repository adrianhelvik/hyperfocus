import checkRouteLengths from './heuristics/checkRouteLengths.mjs'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

const dirname = path.resolve(new URL(import.meta.url).pathname, '..')

export default async function runCodeHeuristics() {
  console.log(chalk.gray('Running heuristics...'))

  await checkRouteLengths()

  console.log(chalk.gray('Heuristics done'))
}
