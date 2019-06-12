exports.up = async knex => {
  await knex.schema.createTable('sessions', table => {
    table.text('sessionId').primary()
    table.text('userId').references('users.userId')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('sessions')
}
