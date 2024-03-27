'use strict'

exports.up = async knex => {
  await knex.schema.createTable('projects', table => {
    table.text('projectId').primary()
    table.text('createdBy').notNullable().references('users.userId')
    table.text('title').notNullable()
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('projects')
}
