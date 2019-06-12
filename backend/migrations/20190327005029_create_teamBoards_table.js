exports.up = async knex => {
  await knex.schema.createTable('teamBoards', table => {
    table.text('teamId').notNullable().references('teams.teamId')
    table.text('boardId').notNullable().references('boards.boardId')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('teamBoards')
}
