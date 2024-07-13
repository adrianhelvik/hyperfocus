import "dotenv/config.js";

import runCodeHeuristics from "./runCodeHeuristics.mjs";
import healthcheck from "./healthcheck.mjs";
import Hapi from "@hapi/hapi";
import chalk from "chalk";

main();

async function main() {
  if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = "development";
    console.warn(
      chalk.yellow.bold(
        'The env variable NODE_ENV was not set! Using "development"'
      )
    );
  }

  await healthcheck.db();

  const { default: createTestUserUnlessExists } = await import(
    "./domain/createTestUserUnlessExists.mjs"
  );

  if (process.env.NODE_ENV === "development") {
    await createTestUserUnlessExists();
    await runCodeHeuristics();
  }

  const server = Hapi.server({
    host: "0.0.0.0",
    port: "1234",
    debug: {
      request: ["error"],
    },
    routes: {
      cors: true,
    },
  });

  server.events.on("response", function (request) {
    console.log(
      request.info.remoteAddress +
        ": " +
        request.method.toUpperCase() +
        " " +
        request.path +
        " --> " +
        request.response.statusCode
    );
  });

  const routes = await import("./routes.mjs");

  for (const route of Object.values(routes)) {
    server.route(route);
  }

  server.route({
    method: "*",
    path: "/{any*}",
    handler(_request, reply) {
      return reply
        .response({
          statusCode: 500,
          error: "Not Found",
          message: "The endpoint was not found",
        })
        .code(404);
    },
  });

  await server.start();
  await healthcheck();

  console.log(chalk.cyan(`Server running at ${server.info.uri}`));
}

process.on("unhandledRejection", (e) => {
  if (e instanceof AggregateError) {
    for (const subError of e.errors) {
      console.error(chalk.red.bold(subError.message));
    }
  } else if (e.message) {
    console.log(chalk.red.bold("Unhandled rejection: " + e.message));
  } else {
    console.error(e);
  }
  console.error("\n" + chalk.red(e.stack));
  process.exit(1);
});
