import Ship from '../ship/ship.js'
import Gameboard from '../gameboard/gameboard.js'
import Player from '../player/player.js'
import {
  PHASE_ERROR,
  PLACEMENT_QUOTA_ERROR,
  FLEET_INCOMPLETE_ERROR
} from '../errors.js'

const PHASE = Object.freeze({
  PLACING: 'placing',
  PLAYING: 'playing',
  OVER: 'over'
})

export default function GameController() {
  let players = [
    Player({ isComputer: false }),
    Player({ isComputer: true })
  ]

  const INITIAL_FLEET = Object.freeze({ 4: 1, 3: 2, 2: 3, 1: 4 })

  let phase = PHASE.PLACING
  let winnerIndex = null
  let remainingShips = { ...INITIAL_FLEET }

  const isOver = () => phase === PHASE.OVER
  const isPlacementComplete = () => Object.values(remainingShips).every(c => c === 0)

  const updateOutcome = () => {
    if (players[0].board.allSunk()) {
      winnerIndex = 1
      phase = PHASE.OVER
    } else if (players[1].board.allSunk()) {
      winnerIndex = 0
      phase = PHASE.OVER
    }
  }

  const getPlacementState = () => ({
    complete: isPlacementComplete(),
    remaining: { ...remainingShips }
  })

  const manualPlace = (ship, { x, y }, orientation) => {
    if (phase !== PHASE.PLACING) throw new Error(PHASE_ERROR)
    if (remainingShips[ship.length] <= 0) throw new Error(PLACEMENT_QUOTA_ERROR)

    players[0].board.placeShip(ship, { x, y }, orientation)
    remainingShips[ship.length] -= 1
  }

  const autoPlace = board => {
    const fleet = { 4: 1, 3: 2, 2: 3, 1: 4 }
    const W = 10, H = 10
    const rand = n => Math.floor(Math.random() * n)
    const randCell = () => ({ x: rand(W), y: rand(H) })
    const randOrient = () => Math.random() < 0.5 ? 'horizontal' : 'vertical'
    const MAX_ATTEMPTS = 500

    for (const [lenStr, count] of Object.entries(fleet)) {
      const len = Number(lenStr)
      for (let i = 0; i < count; i++) {
        const ship = Ship(len)
        let placed = false
        for (let attempts = 0; attempts < MAX_ATTEMPTS && !placed; attempts++) {
          try {
            board.placeShip(ship, randCell(), randOrient())
            placed = true
          } catch {}
        }
        if (!placed) throw new Error('autoplace failed')
      }
    }
  }

  const randomizePlacement = () => {
    resetPlacement()
    autoPlace(players[0].board)
    remainingShips = { 4: 0, 3: 0, 2: 0, 1: 0 }
  }

  const resetPlacement = () => {
    if (phase !== PHASE.PLACING) throw new Error(PHASE_ERROR)
    players[0].board = Gameboard()
    remainingShips = { ...INITIAL_FLEET }
  }

  const beginGame = () => {
    if (phase !== PHASE.PLACING) throw new Error(PHASE_ERROR)
    if (!isPlacementComplete()) throw new Error(FLEET_INCOMPLETE_ERROR)
    autoPlace(players[1].board)
    winnerIndex = null
    phase = PHASE.PLAYING
  }

  const resetGame = () => {
    players = [
      Player({ isComputer: false }),
      Player({ isComputer: true })
    ]
    winnerIndex = null
    phase = PHASE.PLACING
    remainingShips = { ...INITIAL_FLEET }
  }

  const resolveTurn = (x, y) => {
    if (phase !== PHASE.PLAYING) throw new Error(PHASE_ERROR)

    const events = []

    // human shot
    const h = players[0].attack(players[1].board, x, y)
    updateOutcome()
    events.push({ by: 'human', ...h })
    if (winnerIndex !== null || h.hit) return events

    // CPU shot
    while (true) {
      const c = players[1].randomAttack(players[0].board)
      updateOutcome()
      events.push({ by: 'cpu', ...c })
      if (winnerIndex !== null) return events
      if (!c.hit) break
    }

    return events
  }
  
  const humanBoardView = () => players[0].board.getOwnerView()
  const cpuBoardView = () => players[1].board.getPublicView()

  const getPublicState = () => {
    const humanView = humanBoardView()
    const cpuView = cpuBoardView()
    const over = isOver()
    
    return { phase, humanView, cpuView, over, winnerIndex }
  }

  return {
    getPlacementState,
    manualPlace,
    randomizePlacement,
    resetPlacement,
    beginGame,
    resetGame,
    resolveTurn,
    getPublicState
  }
}
