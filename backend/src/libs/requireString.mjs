import Boom from '@hapi/boom'

export default values => {
  for (const name of Object.keys(values)) {
    const value = values[name]

    if (typeof value !== 'string')
      throw Boom.badRequest(`${name} must be a string`)
  }
}
