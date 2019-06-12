exports.up = async knex => {
  await knex.schema.alterTable('decks', table => {
    table.text('color')
  })
}

exports.down = async knex => {
  await knex.schema.alterTable('decks', table => {
    table.dropColumn('color')
  })
}
