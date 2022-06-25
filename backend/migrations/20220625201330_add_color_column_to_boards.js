exports.up = async knex => {
  await knex.schema.alterTable('boards', table => {
    table.text('color')
  })
}

exports.down = async knex => {
  await knex.schema.alterTable('boards', table => {
    table.dropColumn('color')
  })
}
