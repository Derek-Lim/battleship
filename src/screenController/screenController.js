import GameController from '../gameController/gameController.js'
import Ship from '../ship/ship.js'

import {
  CELL_ALREADY_ATTACKED_ERROR,
  PLACESHIP_PLACEMENT_ERROR,
  PHASE_ERROR
} from '../errors.js'

export default function ScreenController() {
  const game = GameController()

  const humanBoardEl = document.getElementById('grid-human')
  const cpuBoardEl = document.getElementById('grid-cpu')
  const paletteEl = document.getElementById('fleet-palette')
  const rotateButton = document.getElementById('rotate-btn')
  const randomizeButton = document.getElementById('randomize-btn')
  const resetButton = document.getElementById('reset-btn')
  const startButton = document.getElementById('start-btn')
  const statusEl = document.getElementById('status')

  let selectedShipLen   = 4
  let placeOrientation  = 'horizontal'
  
  let uiErrorMsg = null

  const mapErrorToMessage = (err) => {
    switch (err.message) {
      case PLACESHIP_PLACEMENT_ERROR:
        return 'You may not overlap ships or place them out of bounds.'
      case CELL_ALREADY_ATTACKED_ERROR:
        return 'You already attacked this cell.'
      case PHASE_ERROR:
        return null
      default:
        return 'Action failed. Try a different move.'
    }
  }

  const setError = (err) => {
    const msg = mapErrorToMessage(err)
    if (msg) uiErrorMsg = msg
  }

  const clearError = () => uiErrorMsg = null

  const SHIP_LENGTHS_DESC = [4, 3, 2, 1]

  const pickNextAvailableLength = (remaining) => {
    if (remaining[selectedShipLen] > 0) return selectedShipLen
    for (const len of SHIP_LENGTHS_DESC) if (remaining[len] > 0) return len
  }

  const renderPalette = (phase, placement) => {
    const { complete, remaining } = placement
    paletteEl.innerHTML = ''

    if (phase === 'playing') {
      startButton.disabled = true
      return
    }

    if (complete) {
      startButton.disabled = false
      const done = document.createElement('div')
      done.textContent = 'Placements complete'
      paletteEl.appendChild(done)
      return
    }

    startButton.disabled = true
    selectedShipLen = pickNextAvailableLength(remaining)

    for (const len of SHIP_LENGTHS_DESC) {
      const count = remaining[len]
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.classList.add('palette__btn')
      btn.dataset.length = String(len)
      btn.textContent = `${len} (${count})`
      if (len === selectedShipLen) btn.classList.add('selected')
      if (count <= 0) btn.disabled = true
      btn.addEventListener('click', () => {
        selectedShipLen = len
        render()
      })
      paletteEl.appendChild(btn)
    }
  }

  const renderHumanBoard = (humanView, phase, complete) => {
    humanBoardEl.innerHTML = ''
    humanView.flat().forEach((cell, i) => {
      const x = i % 10
      const y = Math.floor(i / 10)

      const cellEl = document.createElement('div')
      cellEl.classList.add('board__cell')
      cellEl.dataset.x = String(x)
      cellEl.dataset.y = String(y)

      if (cell.ship) cellEl.classList.add('has-ship')
      if (cell.attacked && cell.ship) cellEl.classList.add('is-hit')
      if (cell.attacked && !cell.ship) cellEl.classList.add('is-miss')
      if (cell.sunk) cellEl.classList.add('is-sunk')

      if (phase === 'placing' && !complete) {
        cellEl.addEventListener('click', () => {
          try {
            game.manualPlace(Ship(selectedShipLen), { x, y }, placeOrientation)
            clearError()
          } catch (err) {
            console.warn(err)
            setError(err)
          }
          render()
        })
      }

      humanBoardEl.appendChild(cellEl)
    })
  }

  const renderCpuBoard = (cpuView, phase) => {
    cpuBoardEl.innerHTML = ''
    cpuView.flat().forEach((cell, i) => {
      const x = i % 10
      const y = Math.floor(i / 10)

      const cellEl = document.createElement('div')
      cellEl.classList.add('board__cell')
      cellEl.dataset.x = String(x)
      cellEl.dataset.y = String(y)

      if (cell.attacked && cell.ship) cellEl.classList.add('is-hit')
      if (cell.attacked && !cell.ship) cellEl.classList.add('is-miss')

      if (phase === 'playing') {
        cellEl.addEventListener('click', () => {
          try {
            game.resolveTurn(x, y)
            clearError()
          } catch (err) {
            console.warn(err)
            setError(err)
          }
          render()
        })
      }

      cpuBoardEl.appendChild(cellEl)
    })
  }

  const updateRotateButton = () => {
    rotateButton.textContent = `Rotate (${placeOrientation})`
  }

  const render = () => {
    const state = game.getPublicState()
    const placing = game.getPlacementState()
    const phase = state.phase

    renderHumanBoard(state.humanView, phase, placing.complete)
    renderCpuBoard(state.cpuView, phase)
    renderPalette(phase, placing)
    updateRotateButton()

    if (uiErrorMsg) {
      statusEl.textContent = uiErrorMsg
      return
    }

    if (phase === 'placing') {
      const { remaining, complete } = placing
      statusEl.textContent = complete
        ? 'Placement complete. Click Start to play.'
        : `Placing - ${SHIP_LENGTHS_DESC.reduce((s, l) => s + remaining[l], 0)} segments left`
    } else if (phase === 'playing') {
      statusEl.textContent = 'Playing — your turn'
    } else {
      const winner = state.winnerIndex === 0 ? 'Human' : 'CPU'
      statusEl.textContent = `Game over — Winner: ${winner}`
    }
  }

  const init = () => {
    updateRotateButton()

    rotateButton.addEventListener('click', () => {
      placeOrientation = placeOrientation === 'horizontal' ? 'vertical' : 'horizontal'
      updateRotateButton()
      render()
    })

    randomizeButton.addEventListener('click', () => {
      game.randomizePlacement()
      clearError()
      render()
    })

    resetButton.addEventListener('click', () => {
      try {
        game.resetGame()
      } catch (err) {
        console.warn(err)
      }
      clearError()

      selectedShipLen = 4
      placeOrientation = 'horizontal'
      randomizeButton.disabled = false
      render()
    })

    startButton.addEventListener('click', () => {
      try {
        game.beginGame()
        clearError()
      } catch (err) {
        console.warn(err)
        setError(err)
      }
      randomizeButton.disabled = true
      render()
    })

    render()
  }

  return { init, render }
}
