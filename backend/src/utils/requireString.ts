import Boom from "@hapi/boom";
import ucfirst from "./ucfirst";

export default function requireString(values: Record<string, any>): asserts values is Record<string, boolean> {
  for (const name of Object.keys(values)) {
    const value = values[name];

    if (typeof value !== "string")
      throw Boom.badRequest(`${ucfirst(name)} is required`);
  }
}
