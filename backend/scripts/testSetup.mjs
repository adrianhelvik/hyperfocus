import child_process from 'child_process'
import chalk from 'chalk'

export default async function () {
  process.env.NODE_ENV = 'test'

  await exec('dropdb subtask_test || true')
  await exec('createdb subtask_test || true')
  await exec('yarn knex migrate:latest')
}

async function exec(cmd) {
  return new Promise((resolve, reject) => {
    const proc = child_process.exec(cmd, {
      env: process.env
    })

    proc.stdout.on('data', data => {
      process.stdout.write(data)
    })

    proc.stderr.on('data', data => {
      process.stderr.write(data)
    })

    proc.on('error', error => {
      console.log(chalk.red(error.message))
      reject(error)
    })

    proc.on('close', code => {
      if (code)
        reject(Error(`Exited with code ${code}`))
      else
        resolve()
    })
  })
}
