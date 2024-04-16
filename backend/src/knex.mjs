// @ts-check

import knexfile from '../knexfile.js'
import Knex from 'knex'

const knex = Knex(knexfile[process.env.NODE_ENV])

export default knex
