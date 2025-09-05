import Gameboard from './gameboard.js'
import Ship from '../ship/ship.js'
import { ATTACK_ARG_ERROR, ATTACK_BOUNDS_ERROR, CELL_ALREADY_ATTACKED_ERROR } from '../errors.js'

describe('receiveAttack', () => {
  // Invalid Input
  describe('input validation', () => {
    const BAD = [
      1.5, 
      Infinity, 
      -Infinity, 
      1n, 
      new Number(3), 
      Symbol('s'), 
      new Date(), 
      NaN, 
      '', 
      '1', 
      true, 
      [], 
      {}, 
      () => {}, 
      null, 
      undefined
    ]

    describe('arity errors', () => {
      const board = Gameboard()

      it('throws when called with no arguments', () => {
        const attack = () => board.receiveAttack()

        expect(attack).toThrow(TypeError)
        expect(attack).toThrow(ATTACK_ARG_ERROR)
      })

      it('throws when called with only one argument', () => {
        const attack = () => board.receiveAttack(1)

        expect(attack).toThrow(TypeError)
        expect(attack).toThrow(ATTACK_ARG_ERROR)
      })
    })

    describe('invalid x values', () => {
      it.each(BAD)('throws if x is %p', bad => {
        const board = Gameboard()
        const attack = () => board.receiveAttack(bad, 1)
  
        expect(attack).toThrow(TypeError)
        expect(attack).toThrow(ATTACK_ARG_ERROR)
      })
    })

    describe('invalid y values', () => {
      it.each(BAD)('throws if y is %p', bad => {
        const board = Gameboard()
        const attack = () => board.receiveAttack(1, bad)
  
        expect(attack).toThrow(TypeError)
        expect(attack).toThrow(ATTACK_ARG_ERROR)
      })
    })
  })

  // Invalid Attack
  describe('invalid attack', () => { 
    it('throws when coordinates are out of bounds', () => {
    
      const board = Gameboard()
      const attack1 = () => board.receiveAttack(-1, 0)
      const attack2 = () => board.receiveAttack(0, -1)
      const attack3 = () => board.receiveAttack(10, 0)
      const attack4 = () => board.receiveAttack(0, 10)
      const attack5 = () => board.receiveAttack(100, 0)
      const attack6 = () => board.receiveAttack(0, -100)

      expect(attack1).toThrow(Error)
      expect(attack1).toThrow(ATTACK_BOUNDS_ERROR)

      expect(attack2).toThrow(Error)
      expect(attack2).toThrow(ATTACK_BOUNDS_ERROR)

      expect(attack3).toThrow(Error)
      expect(attack3).toThrow(ATTACK_BOUNDS_ERROR)

      expect(attack4).toThrow(Error)
      expect(attack4).toThrow(ATTACK_BOUNDS_ERROR)

      expect(attack5).toThrow(Error)
      expect(attack5).toThrow(ATTACK_BOUNDS_ERROR)

      expect(attack6).toThrow(Error)
      expect(attack6).toThrow(ATTACK_BOUNDS_ERROR)
    })

    it('throws when attacking the same cell twice', () => {
      const board = Gameboard()
      const x = 0, y = 0

      board.receiveAttack(x, y)

      const attack = () => board.receiveAttack(x, y)
      expect(attack).toThrow(Error)
      expect(attack).toThrow(CELL_ALREADY_ATTACKED_ERROR)
    })
  })

  // Happy Path
  describe('happy path', () => {
    let board
    const x = 0, y = 0

    beforeEach(() => {
      board = Gameboard()
    })

    const hitLine = (x, y, len, orientation) => {
      for (let i = 0; i < len; i++) {
        orientation === 'horizontal'
          ? board.receiveAttack(x + i, y)
          : board.receiveAttack(x, y + i)
      }
    }

    describe('sinks ship after enough hits', () => {
      it.each([1, 2, 3, 4])('sinks ship length %i (horizontal)', len => {
        const ship = Ship(len)
        const orientation = 'horizontal'
    
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x, y, len, orientation)
  
        expect(ship.isSunk()).toBe(true)
      })
  
      it.each([1, 2, 3, 4])('sinks ship length %i (vertical)', len => {
        const ship = Ship(len)
        const orientation = 'vertical'
    
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x, y, len, orientation)
  
        expect(ship.isSunk()).toBe(true)
      })
    })

    describe('does not sink partially destroyed ship', () => {
      it.each([1, 2, 3, 4])('does not sink ship of length %i (horizontal)', len => {
        const ship = Ship(len)
        const orientation = 'horizontal'
    
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x, y, len - 1, orientation)
  
        expect(ship.isSunk()).toBe(false)
      })

      it.each([1, 2, 3, 4])('does not sink ship of length %i (vertical)', len => {
        const ship = Ship(len)
        const orientation = 'vertical'
    
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x, y, len - 1, orientation)
  
        expect(ship.isSunk()).toBe(false)
      })
    })

    describe('does not sink undamaged ship', () => {
      it.each([1, 2, 3, 4])('does not sink ship of length %i (horizontal)', len => {
        const ship = Ship(len)
        const orientation = 'horizontal'
        
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x, y + 1, len, orientation)

        expect(ship.isSunk()).toBe(false)
      })

      it.each([1, 2, 3, 4])('does not sink ship of length %i (vertical)', len => {
        const ship = Ship(len)
        const orientation = 'vertical'
        
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x + 1, y, len, orientation)

        expect(ship.isSunk()).toBe(false)
      })
    })

    describe('first hit is not start of ship', () => {
      it.each([1, 2, 3, 4])('sinks ship of length %i (horizontal)', len => {
        const ship = Ship(len)
        const orientation = 'horizontal'
        
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x + 1, y, len, orientation)
        board.receiveAttack(x, y)

        expect(ship.isSunk()).toBe(true)
      })

      it.each([1, 2, 3, 4])('sinks ship of length %i (vertical)', len => {
        const ship = Ship(len)
        const orientation = 'vertical'
        
        board.placeShip(ship, {x, y}, orientation)
        hitLine(x, y + 1, len, orientation)
        board.receiveAttack(x, y)

        expect(ship.isSunk()).toBe(true)
      })
    })

    describe('returns status object upon attack', () => {
      it('returns { x, y, hit: true, sunk: true}', () => {
        const ship = Ship(1)
        const orientation = 'horizontal'

        board.placeShip(ship, {x, y}, orientation)
        expect(board.receiveAttack(x, y)).toStrictEqual({ x, y, hit: true, sunk: true})
      })

      it('returns { x, y, hit: true, sunk: false}', () => {
        const ship = Ship(2)
        const orientation = 'horizontal'

        board.placeShip(ship, {x, y}, orientation)
        expect(board.receiveAttack(x, y)).toStrictEqual({ x, y, hit: true, sunk: false})
      })

      it('returns { x, y, hit: false, sunk: false}', () => {
        const ship = Ship(1)
        const orientation = 'horizontal'

        board.placeShip(ship, {x, y}, orientation)
        expect(board.receiveAttack(x, y + 1)).toStrictEqual({ x, y: y + 1, hit: false, sunk: false})
        expect(board.receiveAttack(x + 1, y)).toStrictEqual({ x: x + 1, y, hit: false, sunk: false})
      })

      it('returns exactly {x, y, hit:boolean, sunk:boolean}', () => {
        const ship = Ship(1)
        const orientation = 'vertical'

        board.placeShip(ship, {x, y}, orientation)
        const obj = board.receiveAttack(x, y)
        expect(Object.keys(obj).sort()).toStrictEqual(['hit', 'sunk', 'x', 'y'])
      })
    })
  })

  describe('unique cases', () => {
    it('still succeeds after an out-of-bounds attempt', () => {
      const board = Gameboard()
      const ship = Ship(1)
      board.placeShip(ship, { x: 0, y: 0 }, 'horizontal')

      const badAttack = () => board.receiveAttack(-1, 0)
      expect(badAttack).toThrow(Error)
      expect(badAttack).toThrow(ATTACK_BOUNDS_ERROR)

      const result = board.receiveAttack(0, 0)
      expect(result).toStrictEqual({ x: 0, y: 0, hit: true, sunk: true })
    })

    it('treats different ship instances independently', () => {
      const board = Gameboard()
      const ship1 = Ship(1)
      const ship2 = Ship(1)

      board.placeShip(ship1, {x: 0, y: 0}, 'horizontal')
      board.placeShip(ship2, {x: 1, y: 0}, 'horizontal')

      board.receiveAttack(0, 0)
      expect(ship2.isSunk()).toBe(false)
      board.receiveAttack(1, 0)
      expect(ship2.isSunk()).toBe(true)
    })
  })
})
