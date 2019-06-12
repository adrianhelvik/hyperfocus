import knexfile from '../../knexfile'
import Knex from 'knex'

if (! knexfile[process.env.NODE_ENV])
  throw Error(`No knexfile entry for environment ${process.env.NODE_ENV}`)

export default Knex(knexfile[process.env.NODE_ENV])
