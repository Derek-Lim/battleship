import GameController from './gameController.js'
import Ship from '../ship/ship.js'

const INITIAL = { 4: 1, 3: 2, 2: 3, 1: 4 }

describe('GameController.resetGame', () => {
  it('fully resets from mid-game to fresh placing state', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()
    game.resolveTurn(0, 0)

    game.resetGame()

    const pub = game.getPublicState()
    expect(pub.phase).toBe('placing')
    expect(pub.winnerIndex).toBe(null)
    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: INITIAL
    })
  })

  it('clears both boards so play can start fresh again', () => {
    const game = GameController()

    for (const [index, [lenStr, count]] of Object.entries(INITIAL).entries()) {
      const len = Number(lenStr)
      for (let i = 0; i < count; i++) {
        const x = i * (len + 1)
        const y = index * 2
        game.manualPlace(Ship(len), { x, y }, 'horizontal')
      }
    }

    game.beginGame()
    game.resolveTurn(0, 0)

    game.resetGame()

    expect(() => 
      game.manualPlace(Ship(1), { x: 0, y: 0 }, 'horizontal')
    ).not.toThrow()

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

  it('idempotent by effect (repeated calls leave the same fresh state)', () => {
    const game = GameController()

    game.randomizePlacement()
    game.beginGame()

    game.resetGame()
    const pub1 = game.getPublicState()
    const snap1 = game.getPlacementState()

    game.resetGame()
    const pub2 = game.getPublicState()
    const snap2 = game.getPlacementState()

    expect(pub1).toStrictEqual(pub2)
    expect(snap1).toStrictEqual(snap2)

    expect(pub2.phase).toBe('placing')
    expect(pub2.winnerIndex).toBe(null)
    expect(snap2).toStrictEqual({
      complete: false,
      remaining: INITIAL
    })

    expect(() => 
      game.manualPlace(Ship(1), { x: 0, y: 0 }, 'horizontal')
    ).not.toThrow()
  })

  it('works from any phase (placing, playing, over)', () => {
    const game = GameController()
    const baselinePub = game.getPublicState()
    const baselineSnap = game.getPlacementState()

    game.resetGame()
    expect(game.getPublicState()).toStrictEqual(baselinePub)
    expect(game.getPlacementState()).toStrictEqual(baselineSnap)

    game.randomizePlacement()
    game.beginGame()
    game.resetGame()
    expect(game.getPublicState()).toStrictEqual(baselinePub)
    expect(game.getPlacementState()).toStrictEqual(baselineSnap)

    game.randomizePlacement()
    game.beginGame()
    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      try { game.resolveTurn(x, y) } catch {}
    }
    game.resetGame()
    expect(game.getPublicState()).toStrictEqual(baselinePub)
    expect(game.getPlacementState()).toStrictEqual(baselineSnap)
  })
})
