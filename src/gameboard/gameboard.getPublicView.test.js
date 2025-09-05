import Gameboard from './gameboard.js'
import Ship from '../ship/ship.js'

describe('getPublicView', () => {
  describe('shape', () => {
    it('returns all false on a new board', () => {
      const board = Gameboard()
      const view = board.getPublicView()
  
      for (let y = 0; y < view.length; y++) {
        for (let x = 0; x < view[y].length; x++) {
          expect(view[y][x]).toStrictEqual({ ship: false, attacked: false })
        }
      }
    })
    it('returns identical results if called multiple times without state changes', () => {
      const board = Gameboard()
      const view1 = board.getPublicView()
      const view2 = board.getPublicView()

      expect(view1).toStrictEqual(view2)
    })
  })

  describe('visibility rules', () => {
    it('shows attacked empty cell as {ship:false, attacked:true}', () => {
      const board = Gameboard()
      
      board.receiveAttack(0, 0)
      const view = board.getPublicView()
  
      expect(view[0][0]).toStrictEqual({ ship: false, attacked: true })
    })
  
    it('hides unhit ships as {ship:false, attacked:false}', () => {
      const board = Gameboard()
      const ship = Ship(1)
  
      board.placeShip(ship, { x: 0, y: 0 }, 'horizontal')
      const view = board.getPublicView()
  
      expect(view[0][0]).toStrictEqual({ ship: false, attacked: false })
    })

    it('shows attacked ship cell as {ship:true, attacked:true}', () => {
      const board = Gameboard()
      const ship = Ship(1)
  
      board.placeShip(ship, { x: 0, y: 0 }, 'horizontal')
      board.receiveAttack(0, 0)
      const view = board.getPublicView()
  
      expect(view[0][0]).toStrictEqual({ ship: true, attacked: true })
    })
  })
})
