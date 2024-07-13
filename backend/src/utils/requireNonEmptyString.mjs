// @ts-check

import Boom from "@hapi/boom";
import ucfirst from "./ucfirst.mjs";

/**
 * @param {Record<string, any>} values
 */
export default function requireString(values) {
  for (const name of Object.keys(values)) {
    const value = values[name];

    if (typeof value !== "string" || !value.length)
      throw Boom.badRequest(`${ucfirst(name)} is required`);
  }
}
