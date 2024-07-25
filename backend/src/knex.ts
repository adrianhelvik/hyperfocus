import createKnex, { Knex } from "knex";
import knexfile from "../knexfile.js";
import assert from "assert";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "production" | "development"
    }
  }
}

const config = knexfile[process.env.NODE_ENV];

assert(process.env.NODE_ENV, "Invalid NODE_ENV")
assert(config, "No valid knex config found");

export let knex = createKnex(config);

export function setKnex(updatedKnex: Knex) {
  knex = updatedKnex;
}
