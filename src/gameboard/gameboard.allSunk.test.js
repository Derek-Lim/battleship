import Gameboard from './gameboard.js'
import Ship from '../ship/ship.js'

describe('allSunk', () => {
  describe('empty board', () => {
    it('returns true on an empty board', () => {
      const board = Gameboard()
  
      expect(board.allSunk()).toBe(true)
    })

    it('returns true on an empty board after repeated queries (no-op)', () => {
      const board = Gameboard()

      expect(board.allSunk()).toBe(true)
      board.allSunk()
      board.allSunk()
      expect(board.allSunk()).toBe(true)
    })
  })

  describe('with ships', () => {
    it('returns false while any ship remains', () => {
      const board = Gameboard()
    
      board.placeShip(Ship(1), { x: 0, y: 0 }, 'vertical')
      expect(board.allSunk()).toBe(false)
    })
  
    it('returns false until final segment is hit', () => {
      const board = Gameboard()
  
      board.placeShip(Ship(2), { x: 0, y: 0 }, 'horizontal')
      board.receiveAttack(0, 0)
      expect(board.allSunk()).toBe(false)
    })
  
    it('returns true after the last ship is sunk', () => {
      const board = Gameboard()
  
      board.placeShip(Ship(2), { x: 0, y: 0 }, 'horizontal')
      board.placeShip(Ship(1), { x: 9, y: 9 }, 'horizontal')
  
      board.receiveAttack(0, 0)
      board.receiveAttack(1, 0)
      board.receiveAttack(9, 9)
      expect(board.allSunk()).toBe(true)
    })
    
    it('ignores misses when computing status', () => {
      const board = Gameboard()
  
      board.placeShip(Ship(1), { x: 0, y: 0 }, 'horizontal')
      board.receiveAttack(1, 0)
      board.receiveAttack(0, 1)
      expect(board.allSunk()).toBe(false)
    })
  })

  describe('idempotence', () => {
    it('remains stable with no ships', () => {
      const board = Gameboard()
  
      expect(board.allSunk()).toEqual(board.allSunk())
    })

    it('remains stable with an unsunk ship', () => {
      const board = Gameboard()

      board.placeShip(Ship(1), { x: 0, y: 0 }, 'horizontal')

      expect(board.allSunk()).toEqual(board.allSunk())
    })

    it('remains stable after a ship is sunk', () => {
      const board = Gameboard()

      board.placeShip(Ship(1), { x: 0, y: 0 }, 'horizontal')
      board.receiveAttack(0, 0)

      expect(board.allSunk()).toEqual(board.allSunk())
    })
  })
})
