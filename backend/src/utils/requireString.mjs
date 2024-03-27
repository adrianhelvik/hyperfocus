// @ts-check

import Boom from '@hapi/boom'

/**
 * @param {Record<string, any>} values
 */
export default function requireString(values) {
  for (const name of Object.keys(values)) {
    const value = values[name]

    if (typeof value !== 'string')
      throw Boom.badRequest(`${name} must be a string`)
  }
}
