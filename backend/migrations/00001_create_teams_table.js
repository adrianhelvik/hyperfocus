exports.up = async knex => {
  await knex.schema.createTable('teams', table => {
    table.text('teamId').primary()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('teams')
}
