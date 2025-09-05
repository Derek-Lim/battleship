import { SHIP_LENGTH_ERROR } from '../errors.js'

export default function Ship(length) {
  if (!Number.isInteger(length) || length < 1) {
    throw new TypeError(SHIP_LENGTH_ERROR)
  }

  let hitCount = 0

  const hit = () => {
    hitCount += 1
  }

  const isSunk = () => hitCount >= length

  return { length, hit, isSunk }
}
