import Ship from './ship.js'
import { SHIP_LENGTH_ERROR } from '../errors.js'

describe('Ship', () => {
  describe('invalid construction', () => {
    it('throws when no input', () => {
      expect(() => Ship()).toThrow(TypeError)
      expect(() => Ship()).toThrow(SHIP_LENGTH_ERROR)
    })

    it.each([
      // wrong types
      '1', true, null, undefined, {}, [], () => {},
      Symbol('s'), 1n, new Number(3),
      // bad numbers
      0, -2, 1.5, NaN, Infinity, -Infinity,
    ])('throws for %p', bad => {
      expect(() => Ship(bad)).toThrow(TypeError)
      expect(() => Ship(bad)).toThrow(SHIP_LENGTH_ERROR)
    })
  })

  describe('happy path', () => {
    const hitN = (ship, n) => { for (let i = 0; i < n; i++) ship.hit() }

    it('exposes its length', () => {
      const ship = Ship(2)
      expect(ship.length).toBe(2)
    })

    it('is not sunk before any hits', () => {
      const ship = Ship(2)
      expect(ship.isSunk()).toBe(false)
    })

    it('is not sunk before reaching length', () => {
      const ship = Ship(2)
      hitN(ship, 1)
      expect(ship.isSunk()).toBe(false)
    })
        
    it.each([1, 2, 3, 4])('is sunk at %i hits when length equals hits', len => {
      const ship = Ship(len)
      hitN(ship, len)
      expect(ship.isSunk()).toBe(true)
    })

    it('stays sunk after exceeding length', () => {
      const ship = Ship(2)
      hitN(ship, 3)
      expect(ship.isSunk()).toBe(true)
    })
  })
})
