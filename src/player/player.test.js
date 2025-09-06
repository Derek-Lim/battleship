import Player from './player.js'

describe('player', () => {
  describe('board initialization', () => {
    it.each([
      undefined,
      {},
      {isComputer: false},
      {isComputer: true},
      {isComputer: undefined},
      {isComputer: true, extra: 'ignored'}
    ])('creates a valid board with %p', opts => {
      const p = Player(opts)
      expect(p.board).toHaveProperty('getPublicView', expect.any(Function))
      expect(p.board).toHaveProperty('receiveAttack', expect.any(Function))
      expect(p.board).toHaveProperty('placeShip', expect.any(Function))
      expect(p.board).toHaveProperty('allSunk', expect.any(Function))
    })
    
    it('has distinct boards per player', () => {
      const a = Player()
      const b = Player()
      expect(a.board).not.toBe(b.board)
    })
  })

  describe('mode-specific API', () => {
    it('exposes randomAttack() only for computer players', () => {
      expect(Player({ isComputer: false }).randomAttack).toBeUndefined()
      expect(typeof Player({ isComputer: true }).randomAttack).toBe('function')
    })
  
    it('exposes attack() only for human players', () => {
      expect(Player({ isComputer: true }).attack).toBeUndefined()
      expect(typeof Player({ isComputer: false }).attack).toBe('function')
    })
  })

  describe('attacks', () => {
    it('returns the cell result for attack()', () => {
      const human = Player({ isComputer: false })
      const opponent = Player()
      const attackResult = human.attack(opponent.board, 0, 0)
      expect(attackResult).toStrictEqual({ x: 0, y: 0, hit: false, sunk: false })
    })

    it('returns the cell result for randomAttack()', () => {
      const cpu = Player({ isComputer: true })
      const opponent = Player()
      const attackResult = cpu.randomAttack(opponent.board)
      expect(Object.keys(attackResult).sort()).toStrictEqual(['hit', 'sunk', 'x', 'y'])
    })
  })
})
