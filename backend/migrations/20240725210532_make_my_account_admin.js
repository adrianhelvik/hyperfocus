/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
  await knex("users")
    .where("email", "adrianhelvik100@gmail.com")
    .update("role", "admin");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
  await knex("users")
    .where("email", "adrianhelvik100@gmail.com")
    .update("role", "user");
};
