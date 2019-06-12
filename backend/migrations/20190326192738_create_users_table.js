exports.up = async knex => {
  await knex.schema.createTable('users', table => {
    table.text('userId').primary()
    table.text('username').unique().index()
    table.text('email').notNullable().unique().index()
    table.boolean('verified').notNullable().defaultTo(false)
    table.text('hash').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('users')
}
