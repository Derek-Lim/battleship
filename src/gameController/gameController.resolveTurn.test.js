import GameController from './gameController.js'
import Ship from '../ship/ship.js'
import { PHASE_ERROR } from '../errors.js'

const deterministicPlacement = game => {
  const lengths = [[4, 1], [3, 2], [2, 3], [1, 4]]
  lengths.forEach(([len, count], row) => {
    for (let i = 0; i < count; i++) {
      const x = i * (len + 1)
      const y = row * 2
      game.manualPlace(Ship(len), { x, y }, 'horizontal')
    }
  })
}

const finishGame = game => {
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
    if (game.getPublicState().phase === 'over') return
    game.resolveTurn(x, y)
  }
}

describe('GameController.resolveTurn', () => {
  it('throws in placing phase', () => {
    const game = GameController()
    const act = () => game.resolveTurn(0, 0)
    expect(act).toThrow(Error)
    expect(act).toThrow(PHASE_ERROR)
  })

  it('throws if over phase (guard runs before any coord verification)', () => {
    const game = GameController()
    deterministicPlacement(game)
    game.beginGame()
    finishGame(game)

    const act = () => game.resolveTurn(9, 9)
    expect(act).toThrow(Error)
    expect(act).toThrow(PHASE_ERROR)
  })

  it('emits a human event with input coordinates and result shape', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const events = game.resolveTurn(0, 0)
    expect(events[0]).toEqual(expect.objectContaining({
      by: 'human',
      x: 0,
      y: 0,
      hit: expect.any(Boolean),
      sunk: expect.any(Boolean)
    }))
  })
})
