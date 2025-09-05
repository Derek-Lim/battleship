import Gameboard from './gameboard.js'
import Ship from '../ship/ship.js'
import { PLACESHIP_ARG_ERROR, PLACESHIP_PLACEMENT_ERROR } from '../errors.js'

describe('placeShip', () => {
  // Invalid Input
  describe('invalid input', () => {
    let board, ship

    beforeEach(() => {
      board = Gameboard()
      ship = Ship(1)
    })

    it.each([
      1,
      'ship',
      null,
      [],
      () => {}
    ])('throws if ship arg is %p', bad => {
      const place = () => board.placeShip(bad, {x: 0, y: 0}, 'horizontal')
      expect(place).toThrow(TypeError)
      expect(place).toThrow(PLACESHIP_ARG_ERROR)
    })

    it.each([
      {hit: () => false, isSunk: () => false},
      {length: 2, hit: () => false},
      {length: 2, isSunk: () => false}
    ])('ship instance missing stuff', bad => {
      const place = () => board.placeShip(bad, {x: 0, y: 0}, 'horizontal')
      expect(place).toThrow(TypeError)
      expect(place).toThrow(PLACESHIP_ARG_ERROR)
    })

    it.each([
      {length: () => false, hit: () => false, isSunk: () => false},
      {length: 2, hit: 123, isSunk: () => false},
      {length: 2, hit: () => false, isSunk: 123}
    ])('ship instance has wrong types', bad => {
      const place = () => board.placeShip(bad, {x: 0, y: 0}, 'vertical')
      expect(place).toThrow(TypeError)
      expect(place).toThrow(PLACESHIP_ARG_ERROR)
    })

    it.each([
      1,
      [2, 3],
      {},
      {x: NaN, y: 1},
      {x: 1.5, y: 1},
      {x: 1},
      {y: 1}
    ])('throws if start position arg is %p', bad => {
      const place = () => board.placeShip(ship, bad, 'horizontal')
      expect(place).toThrow(TypeError)
      expect(place).toThrow(PLACESHIP_ARG_ERROR)
    })

    it.each([
      1,
      'diagonal',
      'Horizontal',
      ' vertical ',
      [],
      {}
    ])('throws if orientation arg is %p', bad => {
      const place = () => board.placeShip(ship, {x: 0, y: 0}, bad)
      expect(place).toThrow(TypeError)
      expect(place).toThrow(PLACESHIP_ARG_ERROR)
    })
  })

  // Invalid Placement
  describe('invalid placement', () => {
    it('throws when same ship instance reused', () => {
      const board = Gameboard()
      let ship = Ship(1)

      board.placeShip(ship, { x: 0, y: 0 }, 'horizontal')
      const place = () => board.placeShip(ship, { x: 1, y: 0 }, 'horizontal')
      expect(place).toThrow(Error)
      expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
    })

    describe('out of bounds', () => {
      let board
      let ship
  
      beforeEach(() => {
        board = Gameboard()
        ship = Ship(1)
      })

      it.each([
        {x: 0, y: 10},
        {x: 100, y: 20},
        {x: -1, y: 0},
        {x: -20, y: -200}
      ])('throws when position is %p', bad => {
        const place = () => board.placeShip(ship, bad, 'horizontal')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
      })
    })

    describe('out of bounds by extension', () => {
      let board
      let x, y
  
      beforeEach(() => {
        board = Gameboard()
        x = 9
        y = 9
      })
  
      it.each([2, 3, 4])('does not place horizontal boat of length:%i', len => {
        const ship = Ship(len)

        const place = () => board.placeShip(ship, {x, y}, 'horizontal')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
      })
      it.each([2, 3, 4])('does not place vertical boat of length:%i', len => {
        const ship = Ship(len)

        const place = () => board.placeShip(ship, {x, y}, 'vertical')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
      })
    })

    describe('overlap with existing ship', () => {
      let board
      let x, y
      let battleship1, battleship2

      beforeEach(() => {
        board = Gameboard()
        x = 3
        y = 3
        battleship1 = Ship(4)
        battleship2 = Ship(4)
      })

      it('throws when ship is placed is exactly the same position and orientation', () => {
        board.placeShip(battleship1, {x, y}, 'horizontal')

        const place = () => board.placeShip(battleship2, {x, y}, 'horizontal')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
      })
      
      it('throws when part of the ship overlaps (same orientation)', () => {
        board.placeShip(battleship1, {x, y}, 'vertical')

        const place = () => board.placeShip(battleship2, {x, y: y + 2}, 'vertical')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
      })

      it('throws when part of the ship overlaps (different orientation)', () => {
        board.placeShip(battleship1, {x, y}, 'horizontal')

        const place = () => board.placeShip(battleship2, {x: x + 3, y: y - 3}, 'vertical')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
      })
    })

    describe('partial ship placement', () => {
      it('does not partially place on OOB failure', () => {
        const board = Gameboard()
        const ship = Ship(2)
        const x = 0, y = 9

        const place = () => board.placeShip(ship, {x, y}, 'vertical')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
        expect(board.receiveAttack(x, y)).toStrictEqual({ x, y, hit: false, sunk: false })
      })

      it('does not partially place on overlap failure', () => {
        const board = Gameboard()

        board.placeShip(Ship(1), {x: 1, y: 0}, 'horizontal')

        const place = () => board.placeShip(Ship(3), {x: 0, y: 0}, 'horizontal')
        expect(place).toThrow(Error)
        expect(place).toThrow(PLACESHIP_PLACEMENT_ERROR)
        expect(board.receiveAttack(0, 0)).toStrictEqual({ x: 0, y: 0, hit: false, sunk: false })
        expect(board.receiveAttack(1, 0)).toStrictEqual({ x: 1, y: 0, hit: true, sunk: true })
        expect(board.receiveAttack(2, 0)).toStrictEqual({ x: 2, y: 0, hit: false, sunk: false })
      })
    })
  })

  // Happy Path
  describe('happy path', () => {
    let board
    let x, y

    beforeEach(() => {
      board = Gameboard()
      x = 0
      y = 0
    })

    it.each([1, 2, 3, 4])('places horizontal boat of length:%i', len => {
      const ship = Ship(len)
      board.placeShip(ship, {x, y}, 'horizontal')

      for (let i = 0; i < len - 1; i++) {
        expect(board.receiveAttack(x + i, y)).toStrictEqual({ x: x + i, y, hit: true, sunk: false})
      }
      expect(board.receiveAttack(x + len - 1, y)).toStrictEqual({ x: x + len - 1, y, hit: true, sunk: true})
    })
    it.each([1, 2, 3, 4])('places vertical boat of length:%i', len => {
      const ship = Ship(len)
      board.placeShip(ship, {x, y}, 'vertical')

      for (let i = 0; i < len - 1; i++) {
        expect(board.receiveAttack(x, y + i)).toStrictEqual({ x, y: y + i, hit: true, sunk: false})
      }
      expect(board.receiveAttack(x, y + len - 1)).toStrictEqual({ x, y: y + len - 1, hit: true, sunk: true})
    })
  })
})
