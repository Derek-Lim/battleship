import GameController from './gameController.js'
import Ship from '../ship/ship.js'
import { PHASE_ERROR, PLACEMENT_QUOTA_ERROR } from '../errors.js'

const INITIAL = { 4: 1, 3: 2, 2: 3, 1: 4 }

describe('GameController.resetPlacement', () => {
  it('restores initial placement state and leaves phase unchanged', () => {
    const game = GameController()
    game.randomizePlacement()

    game.resetPlacement()

    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: INITIAL
    })
    const pub = game.getPublicState()
    expect(pub.phase).toBe('placing')
  })

  it.each([4, 3, 2, 1])('clears board and re-enables quota for length %i', len => {
    const game = GameController()

    for (let i = 0; i < INITIAL[len]; i++) {
      game.manualPlace(Ship(len), { x: len * i, y: 0 }, 'horizontal')
    }

    const overQuota = () =>
      game.manualPlace(Ship(len), { x: len * INITIAL[len], y: 0 }, 'vertical')
    expect(overQuota).toThrow(PLACEMENT_QUOTA_ERROR)

    game.resetPlacement()
    expect(overQuota).not.toThrow()
  })

  it('clears the human board so previously used cells are free again', () => {
    const game = GameController()
    game.manualPlace(Ship(4), { x: 0, y: 0 }, 'horizontal')

    const act = () => game.manualPlace(Ship(4), { x: 0, y: 0 }, 'horizontal')
    game.resetPlacement()
    expect(act).not.toThrow()
  })

  it('is idempotent (multiple resets keep initial state)', () => {
    const game = GameController()
    game.resetPlacement()
    game.resetPlacement()

    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: INITIAL
    })
  })

  it('only allowed in placing phase', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const act = () => game.resetPlacement()
    expect(act).toThrow(Error)
    expect(act).toThrow(PHASE_ERROR)
  })

  it('restores initial state and frees cells', () => {
    const game = GameController()

    game.manualPlace(Ship(1), { x: 0, y: 0 }, 'horizontal')
    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: { 4: 1, 3: 2, 2: 3, 1: 3 }
    })

    game.randomizePlacement()
    expect(game.getPlacementState()).toStrictEqual({
      complete: true,
      remaining: { 4: 0, 3: 0, 2: 0, 1: 0 }
    })
    {
      const pub = game.getPublicState()
      expect(pub.phase).toBe('placing')
    }

    game.resetPlacement()
    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: INITIAL
    })
    {
      const pub = game.getPublicState()
      expect(pub.phase).toBe('placing')
    }

    const pub = game.getPublicState()
    expect(pub.phase).toBe('placing')

    expect(() => game.manualPlace(Ship(1), { x: 0, y: 0 }, 'horizontal')).not.toThrow()
  })
})
