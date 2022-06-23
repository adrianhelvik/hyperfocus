const config = {
  client: 'postgresql',
  connection: {
    port: process.env.PGPORT,
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
}

module.exports = {
  development: config,
  test: config,
  production: config,
}
