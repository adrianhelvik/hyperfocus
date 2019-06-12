exports.up = async knex => {
  await knex.schema.createTable('cards', table => {
    table.text('cardId').primary()
    table.text('title').notNullable()
    table.text('deckId').references('decks.deckId').notNullable()
    table.integer('index').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('cards')
}
