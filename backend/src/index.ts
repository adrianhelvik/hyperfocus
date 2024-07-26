import "dotenv/config";

import runCodeHeuristics from "./runCodeHeuristics";
import authenticate from "./domain/authenticate";
import healthcheck from "./healthcheck";
import * as SocketIO from "socket.io";
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
      console.log(
        (request.info.remoteAddress ?? "NO REMOTE ADDRESS") +
        ": " +
        request.method.toUpperCase() +
        " " +
        request.path +
        " --> " +
        ("statusCode" in request.response ? request.response.statusCode : ""),
      );
    });
  }

  (global as any).io = new SocketIO.Server(server.listener);

  io.on("connection", (socket) => {
    let headers: Record<string, string> | null = null;

    socket.on("authenticate", (newHeaders) => {
      headers = lowercaseHeaders(newHeaders);
    });

    let joinIndex = 0;

    socket.on("joinBoard", async (boardId) => {
      joinIndex += 1;
      const currentJoinIndex = joinIndex;
      if (headers) {
        await authenticate({ headers })
        if (joinIndex !== currentJoinIndex) return;
        socket.join(`board:${boardId}`);
      } else {
        socket.once("authenticate", async (newHeaders) => {
          headers = lowercaseHeaders(newHeaders);
          if (headers && await authenticate.isAuthenticated({ headers })) {
            if (joinIndex !== currentJoinIndex) return;
            socket.join(`board:${boardId}`);
          }
        });
      }
    });

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
