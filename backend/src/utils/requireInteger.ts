import Boom from "@hapi/boom";

export default function requireInteger(values: Record<string, any>): asserts values is Record<string, number> {
  for (const name of Object.keys(values)) {
    const value = values[name];

    if (!Number.isInteger(value)) throw Boom.badRequest(`${name} must be an integer`);
  }
}
