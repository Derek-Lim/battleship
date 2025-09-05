import Gameboard from './gameboard.js'
import Ship from '../ship/ship.js'

describe('getOwnerView', () => {
  it('returns a 10x10 grid with all cells empty by default', () => {
    const board = Gameboard()
    const view = board.getOwnerView()

    for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) {
      const cell = view[y][x]
      expect(cell.ship).toBe(false)
      expect(cell.attacked).toBe(false)
      expect(cell.shipId).toBeNull()
      expect(cell.sunk).toBe(false)
    }
  })

  it('shows placed ships with consistent ids and hides unplaced cells', () => {
    const board = Gameboard()

    board.placeShip(Ship(3), { x: 2, y: 4 }, 'horizontal')
    board.placeShip(Ship(2), { x: 0, y: 0 }, 'vertical')

    const view = board.getOwnerView()

    const idsAt = coords => coords.map(([x, y]) => view[y][x].shipId)

    const shipA = [[2,4],[3,4],[4,4]]
    const shipB = [[0,0],[0,1]]

    ;[...shipA, ...shipB].forEach(([x, y]) => {
      expect(view[y][x]).toStrictEqual({
        ship: true,
        attacked: false,
        shipId: expect.any(Number),
        sunk: false
      })
    })

    const [idA1, idA2, idA3] = idsAt(shipA)
    expect(idA1).toBe(idA2)
    expect(idA2).toBe(idA3)

    const [idB1, idB2] = idsAt(shipB)
    expect(idB1).toBe(idB2)

    expect(idA1).not.toBe(idB1)

    expect(view[9][9]).toStrictEqual({
      ship: false,
      attacked: false,
      shipId: null,
      sunk: false
    })
  })

  it('marks only the attacked segment as attacked while ship remains unsunk', () => {
    const board = Gameboard()
    board.placeShip(Ship(3), { x: 2, y: 4 }, 'horizontal')

    board.receiveAttack(3, 4)

    const v = board.getOwnerView()

    expect(v[4][3]).toMatchObject({
      ship: true,
      attacked: true,
      sunk: false
    })

    expect(v[4][2]).toMatchObject({
      ship: true,
      attacked: false,
      sunk: false
    })

    expect(v[4][4]).toMatchObject({
      ship: true,
      attacked: false,
      sunk: false
    })
  })

  it('marks all segments sunk after the final hit', () => {
    const board = Gameboard()
    board.placeShip(Ship(3), { x: 0, y: 0 }, 'vertical')

    board.receiveAttack(0, 0)
    board.receiveAttack(0, 1)
    board.receiveAttack(0, 2)

    const v = board.getOwnerView()
    const a = v[0][0], b = v[1][0], c = v[2][0]

    expect(a.sunk && b.sunk && c.sunk).toBe(true)

    expect(a.shipId).toBe(b.shipId)
    expect(b.shipId).toBe(c.shipId)

    expect(v[9][9]).toMatchObject({
      ship: false,
      attacked: false,
      shipId: null,
      sunk: false,
    })
  })

  it('returns snapshots that remain unchanged if mutated', () => {
    const board = Gameboard()
    const v1 = board.getOwnerView()

    v1[4][5].ship = true
    v1[4][5].attacked = true
    v1[4][5].shipId = 999
    v1[4][5].sunk = true

    const v2 = board.getOwnerView()
    expect(v2[4][5]).toMatchObject({
      ship: false,
      attacked: false,
      shipId: null,
      sunk: false
    })
  })

  it('assigns unique ids to different ships and the same id within a ship', () => {
    const board = Gameboard()
    board.placeShip(Ship(4), { x: 1, y: 1 }, 'horizontal')
    board.placeShip(Ship(2), { x: 6, y: 6 }, 'vertical')

    const v = board.getOwnerView()
    const idsA = [v[1][1].shipId, v[1][2].shipId, v[1][3].shipId, v[1][4].shipId]
    const idsB = [v[6][6].shipId, v[7][6].shipId]

    for (const id of [...idsA, ...idsB]) expect(Number.isInteger(id)).toBe(true)

    expect(new Set(idsA).size).toBe(1)
    expect(new Set(idsB).size).toBe(1)

    expect(idsA[0]).not.toBe(idsB[0])
  })
})
