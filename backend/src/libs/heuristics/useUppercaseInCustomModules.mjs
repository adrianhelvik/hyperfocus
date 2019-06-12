import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

const dirname = path.resolve(
  new URL(import.meta.url).pathname,
  '..',
)

export default async function useUppercaseInCustomModulesHeuristic() {
  const modules = await fs.promises
    .readdir(path.resolve(dirname, '..'))

  console.log()
  console.log(chalk.bold.inverse(` heuristic: Use uppercase in custom modules `))
  console.log()
  console.log(chalk.gray('Custom modules in all lowercase can conflict with the npm ecosystem'))
  console.log()

  for (const m of modules) {
    if (m.startsWith('.'))
      continue
    if (m.toLowerCase() === m)
      console.log(chalk.red.bold(`Custom module in lowercase: ${m.replace(/\.mjs$/, '')}`))
  }

  console.log()
}
