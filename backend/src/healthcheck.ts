import { knex } from "./knex";

export default async function healthcheck() {
  await healthcheck.db();
}

healthcheck.db = async () => {
  await knex.raw("select 1").catch((e) => {
    throw Error(`Failed to connect to database: ${e.message}`);
  });
};
