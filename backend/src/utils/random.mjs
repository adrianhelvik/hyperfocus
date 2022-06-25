import { randomBytes } from 'crypto'

export default () => {
  return new Promise((resolve, reject) => {
    randomBytes(127, (err, buf) => {
      if (err) reject(err)
      else resolve(buf.toString('hex'))
    })
  })
}
