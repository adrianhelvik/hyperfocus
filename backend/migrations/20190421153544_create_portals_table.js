exports.up = async knex => {
  await knex.schema.createTable('portals', table => {
    table.text('portalId').primary()
    table.text('boardId').notNullable().references('boards.boardId')
    table.text('deckId').notNullable().references('decks.deckId')
    table.text('title').notNullable().defaultTo('')
    table.integer('index').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('portals')
}
