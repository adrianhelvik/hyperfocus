import bcrypt from 'bcrypt'
import assert from 'assert'

export default async password => {
  assert(password)

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (error, hash) => {
      if (error) reject(error)
      else resolve(hash)
    })
  })
}
