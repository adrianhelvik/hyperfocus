import runCodeHeuristics from './libs/runCodeHeuristics.mjs'
import Hapi from '@hapi/hapi'
import uuid from './uuid.mjs'
import chalk from 'chalk'

main()

async function main() {
  if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'development'
    console.warn(
      chalk.yellow.bold(
        'The env variable NODE_ENV was not set! Using "development"',
      ),
    )
  }

  const knex = await import('./libs/db.mjs').then(module => module.default)

  const { default: createTestUserUnlessExists } = await import(
    './libs/createTestUserUnlessExists.mjs'
  )

  if (process.env.NODE_ENV === 'development') await createTestUserUnlessExists()

  // await runCodeHeuristics()

  const server = Hapi.server({
    host: '0.0.0.0',
    port: '1234',
    routes: {
      cors: true,
    },
    debug: {
      request: ['read', 'error'],
    },
  })

  const routes = await import('./routes.mjs')

  for (const [name, route] of Object.entries(routes)) {
    server.route(routes[name])
  }

  server.route({
    method: '*',
    path: '/{any*}',
    handler(request, h) {
      return '404: The Subtask API does not implement this endpoint'
    },
  })

  await server.start()

  console.log(chalk.cyan(`Server running at ${server.info.uri}`))
}

process.on('unhandledRejection', e => {
  console.log(chalk.red.bold(e.message))
  console.error('\n' + chalk.red(e.stack))
  process.exit(1)
})
