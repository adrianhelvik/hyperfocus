import crypto from 'crypto'

export default async () => {
  const length = 16
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
