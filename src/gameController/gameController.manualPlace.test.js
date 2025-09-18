import GameController from './gameController.js'
import Ship from '../ship/ship.js'
import { PLACESHIP_PLACEMENT_ERROR } from '../errors.js'

import { PHASE_ERROR, PLACEMENT_QUOTA_ERROR } from '../errors.js'

describe('GameController.manualPlace', () => {
  it('rejects placement outside placing phase', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const act = () => game.manualPlace(Ship(1), { x: 0, y: 0 }, 'horizontal')
    expect(act).toThrow(Error)
    expect(act).toThrow(PHASE_ERROR)
  })

  it('propagates board.placeShip errors and does not change quota', () => {
    const game = GameController()

    const act = () => game.manualPlace(Ship(1), { x: 100, y: 100 }, 'horizontal')
    expect(act).toThrow(Error)
    expect(act).toThrow(PLACESHIP_PLACEMENT_ERROR)

    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: { 4: 1, 3: 2, 2: 3, 1: 4 }
    })
  })

  it('does not change phase', () => {
    const game = GameController()
    game.manualPlace(Ship(4), { x: 0, y: 0 }, 'horizontal')

    const state = game.getPublicState()
    expect(state.phase).toBe('placing')
  })

  describe('accounting', () => {
    it.each([1, 2, 3, 4])('decrements remaining for length %i', len => {
      const game = GameController()
      game.manualPlace(Ship(len), { x: 0, y: 0 }, 'horizontal')
  
      const state = game.getPlacementState()
      const expected = { 4: 1, 3: 2, 2: 3, 1: 4 }
      expected[len]--
      expect(state.remaining).toStrictEqual(expected)
      expect(state.complete).toStrictEqual(false)
    })
  })

  describe('quota guard', () => {
    const INITIAL = { 4: 1, 3: 2, 2: 3, 1: 4 }

    it.each(Object.entries(INITIAL))('blocks placement beyond quota for length %s (quota=%i)', (lenStr, quota) => {
      const len = Number(lenStr)
      const game = GameController()

      for (let i = 0; i < quota; i++) {
        game.manualPlace(Ship(len), { x: i * (len + 1), y: 0 }, 'horizontal')
      }

      const act = () => game.manualPlace(Ship(len), { x: quota * (len + 1), y: 0 }, 'horizontal')
      expect(act).toThrow(Error)
      expect(act).toThrow(PLACEMENT_QUOTA_ERROR)

      const state = game.getPlacementState()
      const expected = { 4: 1, 3: 2, 2: 3, 1: 4 }
      expected[len] = 0
      expect(state.remaining).toStrictEqual(expected)
    })
  })
})