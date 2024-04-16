import isInteger from "is-integer";
import Boom from "@hapi/boom";

/**
 * @param {Record<string, number>} values
 */
export default function requireInteger(values) {
  for (const name of Object.keys(values)) {
    const value = values[name];

    if (!isInteger(value)) throw Boom.badRequest(`${name} must be an integer`);
  }
}
