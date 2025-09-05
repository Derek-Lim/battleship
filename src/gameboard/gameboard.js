import {
  ATTACK_ARG_ERROR,
  ATTACK_BOUNDS_ERROR,
  PLACESHIP_ARG_ERROR,
  PLACESHIP_PLACEMENT_ERROR,
  CELL_OCCUPIED_ERROR,
  CELL_ALREADY_ATTACKED_ERROR,
} from '../errors.js'

export default function Gameboard() {
  const rows = 10
  const columns = 10
  const board = Array.from({ length: rows }, () => 
    Array.from({ length: columns }, () => Cell())
  )
  const placedShips = new Set()
  let nextShipId = 1

  const inBounds = (x, y) => x >= 0 && x < columns && y >= 0 && y < rows

  const getPublicView = () => {
    const opponentView = Array.from({ length: rows }, () => Array.from({ length: columns }))
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const cell = board[y][x]
        const attacked = cell.isAttacked()
        const ship = attacked && cell.hasShip()
        opponentView[y][x] = { ship, attacked }
      }
    }
    return opponentView
  }

  const getOwnerView = () => {
    const ownerView = Array.from({ length: rows }, () => Array.from({ length: columns }))
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const cell = board[y][x]
        ownerView[y][x] = {
          ship: cell.hasShip(),
          attacked: cell.isAttacked(),
          shipId: cell.getShipId(),
          sunk: cell.isShipSunk()
        }
      }
    }
    return ownerView
  }

  const receiveAttack = (x, y) => {
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new TypeError(ATTACK_ARG_ERROR)
    }
    if (!inBounds(x, y)) throw new Error(ATTACK_BOUNDS_ERROR)

    return { x, y, ...board[y][x].attack() }
  }
  
  const placeShip = (ship, {x, y}, orientation) => {
    if (typeof ship !== 'object' || ship === null || Array.isArray(ship)) {
      throw new TypeError(PLACESHIP_ARG_ERROR)
    }
    if (typeof ship.hit !== 'function' || typeof ship.isSunk !== 'function') {
      throw new TypeError(PLACESHIP_ARG_ERROR)
    }
    if (!Number.isInteger(ship.length) || ship.length < 1 || ship.length > 4) {
      throw new TypeError(PLACESHIP_ARG_ERROR)
    }
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new TypeError(PLACESHIP_ARG_ERROR)
    }
    if (orientation !== 'horizontal' && orientation !== 'vertical') {
      throw new TypeError(PLACESHIP_ARG_ERROR)
    }
    if (placedShips.has(ship)) {
      throw new Error(PLACESHIP_PLACEMENT_ERROR)
    }

    const isOccupied = (x, y) => board[y][x].hasShip()

    const targets = 
      orientation === 'horizontal' 
        ? Array.from({length: ship.length}, (_, i) => [x + i, y]) 
        : Array.from({length: ship.length}, (_, i) => [x, y + i])


    if (!targets.every(([tx, ty]) => inBounds(tx, ty))) {
      throw new Error(PLACESHIP_PLACEMENT_ERROR)
    }

    if (targets.some(([tx, ty]) => isOccupied(tx, ty))) {
      throw new Error(PLACESHIP_PLACEMENT_ERROR)
    }

    const id = nextShipId++
    for (const [tx, ty] of targets) board[ty][tx].placeShip(ship, id)

    placedShips.add(ship)
  }

  const allSunk = () => {
    for (const ship of placedShips) if (!ship.isSunk()) return false
    return true
  }

  return { getPublicView, getOwnerView, receiveAttack, placeShip, allSunk }
}

function Cell() {
  let ship = null
  let shipId = null
  let attacked = false

  const hasShip = () => ship !== null

  const placeShip = (newShip, id) => {
    if (ship !== null) throw new Error(CELL_OCCUPIED_ERROR)
    ship = newShip
    shipId = id
  }

  const isAttacked = () => attacked
  const getShipId = () => shipId
  const isShipSunk = () => ship !== null && ship.isSunk()

  const attack = () => {
    if (attacked) throw new Error(CELL_ALREADY_ATTACKED_ERROR)
    attacked = true
    if (ship !== null) {
      ship.hit()
      return { hit: true, sunk: ship.isSunk() }
    }
    return { hit: false, sunk: false }
  }

  return { hasShip, placeShip, isAttacked, attack, getShipId, isShipSunk }
}
