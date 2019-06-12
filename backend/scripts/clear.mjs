import readline from 'readline'

export default () => {
  const blank = '\n'.repeat(process.stdout.rows + 100)
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
}
