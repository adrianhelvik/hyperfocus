import sleep from 'sleep-promise'
import clear from 'clear'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

const src = path.resolve(
  new URL(import.meta.url).pathname,
  '..',
  '..',
  'src',
)

process.env.NODE_ENV = 'test'

let successes = []
let cache = {}
let specs = []

global.it = function(name, fn) {
  specs.push({name, fn})
}

void async function main() {
  await import('./testSetup')
    .then(module => {
      if (typeof module.default === 'function')
        return module.default()
    })
  cache = {}
  await loop()
}()

async function loop() {
  successes = []
  const specFiles = await getSpecFiles(src)
  const changed = []
  for (const file of specFiles) {
    if (await isChanged(file))
      changed.push(file)
  }
  if (changed.length) {
    clear()
    changed.map(dirstr).forEach(x => console.log(x))
  }
  for (const file of changed) {
    await testFile(file)
  }
  await sleep(100)
  loop()
}

async function getSpecFiles(dir, files = []) {
  const dirFiles = await fs.promises.readdir(dir)
  for (const file of dirFiles) {
    const fpath = path.resolve(dir, file)
    const stat = await fs.promises.lstat(fpath)
    if (stat.isDirectory()) {
      await getSpecFiles(fpath, files)
    } else if (fpath.endsWith('.spec.mjs')) {
      files.push(fpath)
    }
  }
  return files
}

async function testFile(file) {
  console.log(chalk.gray(`Running "${dirstr(file)}"`))
  let errored = false
  try {
    specs = []
    await import(file)
    for (const {name, fn} of specs) {
      try {
        await fn()
        console.log(chalk.green(`Success: "${name}"`))
      } catch (e) {
        errored = true
        console.log(chalk.red(`Failure in ${name}!\n\n${estr(e)}`))
      }
    }
    if (! errored)
      console.log(chalk.green(`Success: "${dirstr(file)}"`))
    else
      console.log(chalk.red(`Failure in: "${dirstr(file)}"`))
  } catch (e) {
    console.log(chalk.red(`Failure!\n${estr(e)}`))
    return false
  }
  return ! errored
}

function estr(error) {
  const stack = '\n' + chalk.bold.red(error.message) + '\n\n' + error.stack
    .split('\n')
    .map(s => '  ' + s)
    .join('\n')
    + '\n'

  return chalk.red(stack)
}

async function isChanged(file) {
  let prev = cache[file]

  cache[file] = await fs.promises.readFile(file, 'utf8')

  return prev !== cache[file]
}

function dirstr(str) {
  if (str.startsWith(src))
    return str.replace(src, '<src>')
  return str
}
