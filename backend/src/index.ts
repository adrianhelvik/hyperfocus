import "dotenv/config";

import assertCanEditBoard from "./domain/assertCanEditBoard";
import emitUserEvent, { Severity } from "./emitUserEvent";
import runCodeHeuristics from "./runCodeHeuristics";
import errorToBoolean from "./utils/errorToBoolean";
import formatDuration from "./utils/formatDuration";
import authenticate from "./domain/authenticate";
import healthcheck from "./healthcheck";
import * as SocketIO from "socket.io";
import { Boom } from "@hapi/boom";
import { knex } from "./knex";
import Hapi from "@hapi/hapi";
import chalk from "chalk";
import fs from "fs";

main();

declare global {
  const io: SocketIO.Server;
}

async function main() {
  if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = "development";
    console.warn(
      chalk.yellow.bold(
        'The env variable NODE_ENV was not set! Using "development"',
      ),
    );
  }

  await healthcheck.db();

  await knex.migrate.latest().then(
    () => {
      console.log("Database migration complete!");
    },
    (error) => {
      console.error(
        "Failed to migrate database:",
        "stack" in error ? error.stack : error,
      );
      console.log(fs.readdirSync("/backend"));
    },
  );

  const { default: createTestUserUnlessExists } = await import(
    "./domain/createTestUserUnlessExists"
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

  if (process.env.NODE_ENV === "development") {
    server.events.on("response", function(request) {
      console.log(chalk.gray(
        request.method.toUpperCase() +
        " " +
        request.path +
        " --> " +
        ("statusCode" in request.response ? request.response.statusCode : ""),
      ));
    });
  }

  (global as any).io = new SocketIO.Server(server.listener);

  io.on("connection", (socket) => {
    console.log(chalk.gray("A socket.io connection was created"));

    socket.on("joinBoard", async (headers: any, boardId) => {
      headers = lowercaseHeaders(headers);
      console.log(chalk.gray.bold("Attempting to join board..."));
      if (!await errorToBoolean(assertCanEditBoard({ headers }, boardId))) return console.error(chalk.red("assertion for joining board failed"));
      socket.join(`board:${boardId}`);
      console.log(chalk.cyan("socket.io joinBoard successful"))
    });

    socket.on("joinAdmin", async (headers: any) => {
      headers = lowercaseHeaders(headers);
      console.log(chalk.gray.bold("Attempting to join admin..."));
      const authInfo = await authenticate({ headers })
        .catch(() => null);
      if (!authInfo) return console.error(chalk.red("No auth info to join admin"));
      if (authInfo.role !== "admin") return console.error(chalk.red("Not admin role. Not joining admin"));
      socket.join("admin");
      console.log(chalk.cyan("socket.io joinAdmin successful"))
    })

    socket.on("leaveBoard", (boardId) => {
      socket.leave(`board:${boardId}`);
    });

    function lowercaseHeaders(headers: Record<string, string>) {
      const result: Record<string, string> = {};
      for (const [key, val] of Object.entries(headers)) {
        if (typeof key === "string") {
          result[key.toLowerCase()] = val;
        }
      }
      return result;
    }
  });

  const routes = await import("./routes");

  for (const route of Object.values(routes)) {
    const handler = route.handler.bind(route);
    route.handler = (async (...args: any[]) => {
      const start = process.hrtime.bigint()
      let error: any = null;
      try {
        return await handler(...args);
      } catch (e) {
        error = e;
        throw e;
      } finally {
        let severity: Severity = "INFO";
        if (error && error instanceof Boom) severity = "WARNING";
        else if (error) severity = "ERROR";
        const end = process.hrtime.bigint();
        const duration = end - start;
        emitUserEvent(
          "route",
          severity,
          `${route.method} ${route.path}`,
          Number((duration / 1000n) | 0n),
        );
      }
    }) as any;
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

process.on("unhandledRejection", (e: any) => {
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
