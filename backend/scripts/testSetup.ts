import { GenericContainer } from "testcontainers";
import { setKnex } from "../src/knex";
import createKnex from "knex";

beforeAll(async () => {
  // 1. Create test container
  const container = await new GenericContainer("postgres")
    .withExposedPorts(5432)
    .start();

  // 2. Register knex config
  const port = container.getMappedPort(5432);
  const host = container.getHost();

  const knex = createKnex({
    connection: {
      port,
      host
    },
  });

  setKnex(knex)

  // 3. Migrate database
  await knex.migrate.latest();
});
