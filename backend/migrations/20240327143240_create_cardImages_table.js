/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => {
  return knex.schema.createTable('cardImages', table => {
    table.text('url').primary();
    table.text('cardId').references('cards.cardId').index().notNullable();
    table.integer('index').notNullable();
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = knex => {
  return knex.schema.dropTable('cardImages')
};
