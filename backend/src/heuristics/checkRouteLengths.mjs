// @ts-check

import chalk from "chalk";

export default async function checkRouteLengths() {
  header("heuristic: Keep route definitions short");

  const routes = await import("../routes.mjs");

  let sum = 0;
  let ok = 0;

  for (const name of Object.keys(routes)) {
    if (!name.endsWith("Route"))
      console.log(chalk.yellow(`Route export not ending in "Route": ${name}`));

    const route = routes[name];

    const lines = route.handler.toString().split("\n");

    const len = lines.length;

    sum += 1;

    const routeDesc = `${route.method} ${route.path}`;

    if (len > 100)
      console.log(
        chalk.red.bold.inverse(
          `Route longer than 100 lines: ${routeDesc} (${len})`
        )
      );
    else if (len > 80)
      console.log(
        chalk.red.bold(`Route longer than 80 lines: ${routeDesc} (${len})`)
      );
    else if (len > 60)
      console.log(
        chalk.red(`Route longer than 60 lines: ${routeDesc} (${len})`)
      );
    else if (len > 40)
      console.log(
        chalk.yellow(`Route longer than 40 lines: ${routeDesc} (${len})`)
      );
    else if (len > 20)
      console.log(
        chalk.gray(`Route longer than 20 lines: ${routeDesc} (${len})`)
      );
    else {
      console.log(chalk.green(`Route length ok: ${routeDesc} (${len})`));
      ok += 1;
    }
  }

  console.log();
  console.log(
    chalk.green.bold.inverse(
      ` ${((ok / sum) * 100).toFixed(0)}% of routes were short enough `
    )
  );

  console.log();
}

/**
 * @param {string} text
 */
function header(text) {
  console.log();
  console.log(chalk.bold.inverse(` ${text} `));
  console.log();
}
