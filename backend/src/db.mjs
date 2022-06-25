import knexfile from '../knexfile.js'
import Knex from 'knex'

export default Knex(knexfile[process.env.NODE_ENV])
