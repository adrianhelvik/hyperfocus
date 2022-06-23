import getDenormalizedBoard from './getDenormalizedBoard.mjs'
import arrayMove from './arrayMove.mjs'
import knex from './db.mjs'

export default async function moveBoardChildToIndex({ boardId, index, item }) {
  const board = await getDenormalizedBoard(boardId)
  let fromIndex = -1

  for (let i = 0; i < board.children.length; i++) {
    const child = board.children[i]
    if (
      child.type === item.type &&
      ((child.type === 'portal' && child.portalId === item.portalId) ||
        (child.type === 'deck' && child.deckId === item.deckId))
    ) {
      fromIndex = i
      break
    }
  }

  if (fromIndex === -1) throw Error('Could not find item')

  arrayMove(board.children, fromIndex, index)
  console.log(`move: ${fromIndex} -> ${index}`)

  for (let i = 0; i < board.children.length; i++) {
    const child = board.children[i]
    if (child.index !== i) {
      switch (child.type) {
        case 'portal':
          console.log(`moving ${child.index} -> ${i}`)
          await knex('portals')
            .where('portalId', child.portalId)
            .update({ index: i })
          break
        case 'deck':
          console.log(`moving ${child.index} -> ${i}`)
          await knex('decks').where('deckId', child.deckId).update({ index: i })
          break
        default:
          throw Error(`Unknown type: ${child.type}`)
      }
    }
  }
}
