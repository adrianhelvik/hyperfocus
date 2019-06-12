exports.up = async knex => {
  await knex.schema.createTable('boards', table => {
    table.text('boardId').primary()
    table.text('title').notNullable().defaultTo('')
    table.text('createdBy').notNullable().references('users.userId')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('boards')
}
