exports.up = async knex => {
  await knex.schema.createTable('decks', table => {
    table.text('deckId').primary()
    table.text('boardId').notNullable().references('boards.boardId')
    table.text('title').notNullable().defaultTo('')
    table.integer('index').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('decks')
}
