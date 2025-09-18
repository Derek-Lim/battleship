import GameController from './gameController.js'
import Ship from '../ship/ship.js'

const finishGame = game => {
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
    if (game.getPublicState().phase === 'over') return
    game.resolveTurn(x, y)
  }
}

describe('GameController.getPublicState', () => {
  it('shows placing state accurately and idempotent-ly', () => {
    const game = GameController()

    const state1 = game.getPublicState()
    const state2 = game.getPublicState()

    expect(state1.phase).toBe('placing')
    expect(state1.humanView).toEqual(expect.any(Object))
    expect(state1.cpuView).toEqual(expect.any(Object))
    expect(state1.over).toBe(false)
    expect(state1.winnerIndex).toBeNull()

    expect(state1).toStrictEqual(state2)
    expect(state1).not.toBe(state2)
    expect(state1.humanView).not.toBe(state2.humanView)
    expect(state1.cpuView).not.toBe(state2.cpuView)
  })

  it('shows playing state accurately and is idempotent', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const state1 = game.getPublicState()
    const state2 = game.getPublicState()

    expect(state1.phase).toBe('playing')
    expect(state1.humanView).toEqual(expect.any(Object))
    expect(state1.cpuView).toEqual(expect.any(Object))
    expect(state1.over).toBe(false)
    expect(state1.winnerIndex).toBeNull()

    expect(state1).toStrictEqual(state2)
    expect(state1).not.toBe(state2)
    expect(state1.humanView).not.toBe(state2.humanView)
    expect(state1.cpuView).not.toBe(state2.cpuView)
  })

  it('shows over state accurately and is idempotent', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()
    finishGame(game)

    const state1 = game.getPublicState()
    const state2 = game.getPublicState()

    expect(state1.phase).toBe('over')
    expect(state1.humanView).toEqual(expect.any(Object))
    expect(state1.cpuView).toEqual(expect.any(Object))
    expect(state1.over).toBe(true)
    expect(state1.winnerIndex === 0 || state1.winnerIndex === 1).toBe(true)

    expect(state1).toStrictEqual(state2)
    expect(state1).not.toBe(state2)
    expect(state1.humanView).not.toBe(state2.humanView)
    expect(state1.cpuView).not.toBe(state2.cpuView)
  })

  it('prevents mutation of published views (defensive copies)', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()
    
    const snap = game.getPublicState()
    snap.humanView[0][0] = { attacked: true, ship: true }
    snap.cpuView[0][0] = { attacked: true, ship: true }
    snap.phase = 'hijacked'
    snap.over = true
    snap.winnerIndex = 99

    const fresh = game.getPublicState()
    expect(fresh.humanView[0][0]).not.toEqual({ attacked: true, ship: true })
    expect(fresh.cpuView[0][0]).not.toEqual({ attacked: true, ship: true })
    expect(fresh.phase).toBe('playing')
    expect(fresh.over).toBe(false)
    expect(fresh.winnerIndex).toBeNull()
  })

  it('register attacks and hide un-attacked ships in CPU board', () => {
    const game = GameController()
    game.randomizePlacement()
    game.beginGame()

    const attackCells = [[0, 0], [4, 5], [9, 9]]
    attackCells.forEach(([x, y]) => game.resolveTurn(x, y))
    
    const state = game.getPublicState()
    const wasAttacked = (x, y) => attackCells.some(([ax, ay]) => ax === x && ay === y)

    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const cell = state.cpuView[y][x]
      if (wasAttacked(x, y)) {
        expect(cell.ship).toEqual(expect.any(Boolean))
        expect(cell.attacked).toBe(true)
      } else {
        expect(cell.ship).toBe(false)
        expect(cell.attacked).toBe(false)
      }
    }
  })

  it('register attacks and show all ships in human board', () => {
    const game = GameController()

    const cellsWithShips = []
    ;(function deterministicPlacement(game) {
      const lengths = [[4, 1], [3, 2], [2, 3], [1, 4]]
      lengths.forEach(([len, count], row) => {
        for (let i = 0; i < count; i++) {
          const x = i * (len + 1)
          const y = row * 2
          game.manualPlace(Ship(len), { x, y }, 'horizontal')
          for (let j = 0; j < len; j++) cellsWithShips.push([x + j, y])
        }
      })
    })(game)

    game.beginGame()

    const events = (() => {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
        const e = game.resolveTurn(x, y)
        if (e.some(ev => ev.by === 'cpu')) return e
      }
      return []
    })()
    const cpuAttacks = events.filter(ev => ev.by === 'cpu').map(ev => [ev.x, ev.y])

    const state = game.getPublicState()
    const hasShip = (x, y) => cellsWithShips.some(([ax, ay]) => ax === x && ay === y)
    const wasAttacked = (x, y) => cpuAttacks.some(([ax, ay]) => ax === x && ay === y)

    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const cell = state.humanView[y][x]
      expect(cell.ship).toBe(hasShip(x, y))
      expect(cell.attacked).toBe(wasAttacked(x, y))
    }
  })
})
