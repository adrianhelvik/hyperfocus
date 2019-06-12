exports.up = async knex => {
  await knex.schema.createTable('userTeams', table => {
    table.text('userId').notNullable().references('users.userId')
    table.text('teamId').notNullable().references('teams.teamId')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('userTeams')
}
