import Gameboard from '../gameboard/gameboard.js'
import { PLAYER_NO_MOVES_ERROR } from '../errors.js'

export default function Player({ isComputer = false } = {}) {
  const board = Gameboard()
  const deck = []
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) deck.push([x, y])

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  const randomAttack = opponent => {
    if (deck.length === 0) throw new Error(PLAYER_NO_MOVES_ERROR)
    const [x, y] = deck.pop()
    return opponent.receiveAttack(x, y)
  }

  const attack = (opponent, x, y) => opponent.receiveAttack(x, y)

  return { board, ...(isComputer ? { randomAttack } : { attack }) }
}
