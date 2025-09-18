import GameController from './gameController.js'

describe('Gameboard.randomizePlacement', () => {
  it('completes the human fleet', () => {
    const game = GameController()
    game.randomizePlacement()

    expect(game.getPlacementState()).toStrictEqual({
      complete: true,
      remaining: { 4: 0, 3: 0, 2: 0, 1: 0 }
    })
  })

  it('does not change phase', () => {
    const game = GameController()
    game.randomizePlacement()

    const state = game.getPublicState()
    expect(state.phase).toBe('placing')
  })

  it('is repeatable and leaves count at zero', () => {
    const game = GameController()
    game.randomizePlacement()
    game.randomizePlacement()
   
    expect(game.getPlacementState()).toStrictEqual({
      complete: true,
      remaining: { 4: 0, 3: 0, 2: 0, 1: 0 }
    })
  })

  it('allows restoration of initial counts (with resetPlacement)', () => {
    const game = GameController()
    game.randomizePlacement()
    game.resetPlacement()

    expect(game.getPlacementState()).toStrictEqual({
      complete: false,
      remaining: { 4: 1, 3: 2, 2: 3, 1: 4 }
    })
  })

  it('allows beginGame to proceed', () => {
    const game = GameController()
    game.randomizePlacement()
    expect(() => game.beginGame()).not.toThrow()
  })
})
