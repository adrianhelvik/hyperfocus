module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'subtask_dev',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: '/var/run/postgresql',
      database: 'subtask_prod',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

}
