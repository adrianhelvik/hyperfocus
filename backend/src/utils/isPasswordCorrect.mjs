import bcrypt from 'bcrypt'

export default (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err)
      else resolve(res)
    })
  })
}
