import GameController from './gameController.js'
import Ship from '../ship/ship.js'
import { PHASE_ERROR, FLEET_INCOMPLETE_ERROR } from '../errors.js'

describe('gameController.beginGame', () => {
  it('rejects when fleet is incomplete', () => {
    const game = GameController()

    const act = () => game.beginGame()
    expect(act).toThrow(Error)
    expect(act).toThrow(FLEET_INCOMPLETE_ERROR)

    game.manualPlace(Ship(1), { x: 0, y: 0 }, 'vertical')
    expect(act).toThrow(Error)
    expect(act).toThrow(FLEET_INCOMPLETE_ERROR)
  })

  it('starts the game when fleet is complete', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const pub = game.getPublicState()
    expect(pub.phase).toBe('playing')
    expect(pub.winnerIndex).toBe(null)
  })

  it('rejects when not in playing phase (idempotence-by-guard)', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const act = () => game.beginGame()
    expect(act).toThrow(Error)
    expect(act).toThrow(PHASE_ERROR)
  })

  it('does not mutate human placement accounting', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    expect(game.getPlacementState()).toStrictEqual({
      complete: true,
      remaining: { 4: 0, 3: 0, 2: 0, 1: 0 }
    })
  })

  it('enables play (CPU board is set up; a human turn returns events', () => {
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
