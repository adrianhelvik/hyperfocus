import runCodeHeuristics from './libs/runCodeHeuristics.mjs'
import sleep from 'sleep-promise'
import Hapi from '@hapi/hapi'
import uuid from './uuid.mjs'
import clear from 'clear'
import chalk from 'chalk'

main()

async function main() {
  await sleep(100)
  clear()

  if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'development'
    console.warn(chalk.yellow.bold('The env variable NODE_ENV was not set! Using "development"'))
  }

  const knex = await import('./libs/db.mjs')
    .then(module => module.default)

  const { default: createTestUserUnlessExists } = await import('./libs/createTestUserUnlessExists.mjs')

  if (process.env.NODE_ENV === 'development')
    await createTestUserUnlessExists()

  // await runCodeHeuristics()

  const server = Hapi.server({
    port: '1234',
    routes: {
      cors: true
    },
    debug: {
      request: ['read', 'error']
    },
  })

  const routes = await import('./routes.mjs')

  for (const name of Object.keys(routes)) {
    if (process.env.NODE_ENV === 'development') {
      const handler = routes[name].handler
      routes[name].handler = (...args) => {
        console.log(chalk.gray(`${routes[name].method} ${routes[name].path}: ${JSON.stringify(args[0].payload || null)}`))
        return handler(...args)
      }
    }
    server.route(routes[name])
  }

  await server.start()

  console.log(chalk.cyan(`Server running at ${server.info.uri}`))
}

process.on('unhandledRejection', e => {
  console.log(chalk.red.bold(e.message))
  console.error('\n'+chalk.red(e.stack))
  process.exit(1)
})
