import GameController from './gameController'
import Ship from '../ship/ship.js'

describe('GameController.getPlacementState', () => {
  const INITIAL_FLEET = { 4: 1, 3: 2, 2: 3, 1: 4 }
  const ZERO_FLEET = { 4: 0, 3: 0, 2: 0, 1: 0 }

  it ('returns the initial placement snapshot', () => {
    const game = GameController()
    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: INITIAL_FLEET
    })
  })

  it('updates counts as ships are placed and only flips complete at the end', () => {
    const game = GameController()
    let remaining = { ...INITIAL_FLEET }

    for (const [index, [lenStr, count]] of Object.entries(INITIAL_FLEET).entries()) {
      const len = Number(lenStr)
      for (let i = 0; i < count; i++) {
        const state = game.getPlacementState()
        expect(state.remaining).toStrictEqual(remaining)
        expect(state.complete).toBe(false)

        game.manualPlace(Ship(len), { x: i * (len + 1), y: index * 2 }, 'horizontal')

        remaining[len]--
      }
    }

    const finalState = game.getPlacementState()
    expect(finalState.remaining).toStrictEqual({ 4:0, 3:0, 2:0, 1:0 })
    expect(finalState.complete).toBe(true)
  })

  it('returns defensive copies (caller cannot mutate controller state)', () => {
    const game = GameController()
    const snap1 = game.getPlacementState()

    snap1.complete = true
    snap1.remaining[4] = 999

    const snap2 = game.getPlacementState()
    expect(snap2).toStrictEqual({
      complete: false,
      remaining: INITIAL_FLEET
    })
  })

  it('is idempotent and returns fresh objects', () => {
    const game = GameController()
    const a = game.getPlacementState()
    const b = game.getPlacementState()

    expect(a).toStrictEqual(b)
    expect(a).not.toBe(b)
    expect(a.remaining).not.toBe(b.remaining)
  })

  it('randomizePlacement completes the fleet', () => {
    const game = GameController()
    game.randomizePlacement()
    expect(game.getPlacementState()).toStrictEqual({
      complete: true,
      remaining: ZERO_FLEET
    })
  })

  it('resetPlacement restores the initial fleet after randomize', () => {
    const game = GameController()
    game.randomizePlacement()
    game.resetPlacement()
    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: INITIAL_FLEET
    })
  })
})
