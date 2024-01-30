import './style.css'

const gamesBoardContainer = document.querySelector('#gamesboard-container')
const optionContainer = document.querySelector('.option-container')
const flipButton = document.querySelector('#flip-button')
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')

let angle = 0

// toggles the draggable ship options between vertical and horizontal
function flip () {
  const optionShips = Array.from(optionContainer.children)
  angle = angle === 0 ? 90 : 0
  optionShips.forEach(optionShip => {
    optionShip.style.transform = `rotate(${angle}deg)`
  })
}
flipButton.addEventListener('click', flip)

// Creating Boards

const width = 10

// create gameboard
function createBoard (color, user) {
  const gameBoardContainer = document.createElement('div')
  gameBoardContainer.classList.add('game-board')
  gameBoardContainer.style.backgroundColor = color
  gameBoardContainer.id = user

  // create 100 blocks in the gameboard
  for (let i = 0; i < width * width; i++) {
    const block = document.createElement('div')
    block.classList.add('block')
    block.id = i
    gameBoardContainer.append(block)
  }

  gamesBoardContainer.append(gameBoardContainer)
}

// create gameboards; one for player and another for computer
createBoard('yellow', 'player')
createBoard('pink', 'computer')

// Creating Ships
class Ship {
  constructor (name, length) {
    this.name = name
    this.length = length
  }
}

const destroyer = new Ship('destroyer', 2)
const submarine = new Ship('submarine', 3)
const cruiser = new Ship('cruiser', 3)
const battleship = new Ship('battleship', 4)
const carrier = new Ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]

// keep track of whether a ship option is successfully placed on gameboard
let notDropped

function getValidity (allBoardBlocks, isHorizontal, startIndex, ship) {
  // if ship will go out of bounds, move ship start point such that it doesn't
  let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex : 
    width * width - ship.length :
    startIndex <= width * width - width * ship.length ? startIndex :
      startIndex - ship.length * width + width

  // keep track of blocks that contain ships
  let shipBlocks = []

  // Add blocks that contain ships to shipBlocks array
  for (let i = 0; i < ship.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i])
    } else {
      shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
    }
  }

  // keeps track of whether ships will split into two
  let valid

  // prevent horizontal ships from spliting into two
  // (if it is close enough to the right edge of gameboard, it will wrap)
  if (isHorizontal) {
    shipBlocks.every((_shipBlock, index) =>
      valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1))
    )
  } else {
    shipBlocks.every((_shipBlock, index) => 
      valid = shipBlocks[0].id < 90 + (width * index + 1))
  }

  // keeps track of whether ships overlap each other
  const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

  return { shipBlocks, valid, notTaken }
}

// add ships to the gameboard
function addShipPiece (user, ship, startId) {
  // if user is computer, randomly assign horizontal value and ship start position,
  // if user is player, use selected horizontal value and ship start position
  const allBoardBlocks = document.querySelectorAll(`#${user} div`)
  let randomBoolean = Math.random() < 0.5
  let isHorizontal = user === 'player' ? angle === 0 : randomBoolean
  let randomStartIndex = Math.floor(Math.random() * width * width)
  let startIndex = startId ? startId : randomStartIndex

  // check validity of ship positions
  const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

  // if ship position is valid, add assign ship positions on gameboard
  if (valid && notTaken) {
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add(ship.name)
      shipBlock.classList.add('taken')
    })
  // if ship positions are invalid,
  } else {
    // and user is computer, rerun the function until it becomes valid
    if (user === 'computer') addShipPiece(user, ship, startId)
    // and user is player, do not place the ship on the gameboard
    if (user === 'player') notDropped = true
  }
}
// add all 5 ships to the computer gameboard
ships.forEach(ship => addShipPiece('computer', ship))

// Drag player ships

// keep track of which draggable ship option the player selected
let draggedShip

const optionShips = Array.from(optionContainer.children)
// if user begins to drag a ship option, keep track of when ship was selected
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
  // if user drags a ship option over a particular block, add highlight styling
  playerBlock.addEventListener('dragover', dragOver)
  // if user drops a ship option, place the ship on the gameboard
  playerBlock.addEventListener('drop', dropShip)
})

// saves the ship option that is being dragged
function dragStart (e) {
  notDropped = false
  draggedShip = e.target
}

// add styling to the gameboard blocks that user drags over (with ship option)
function dragOver (e) {
  e.preventDefault()
  const ship = ships[draggedShip.id]
  highlightArea(e.target, ship)
}

// if user drops the ship in a valid position, place the ship on the gameboard
function dropShip (e) {
  const startId = e.target.id
  const ship = ships[draggedShip.id]
  addShipPiece('player', ship, startId)
  if (!notDropped) {
    draggedShip.remove()
  }
}

// Add highlight

// Add style to area that a user drags a ship option over
function highlightArea (startIndex, ship) {
  const allBoardBlocks = document.querySelectorAll('#player div')
  // take note of the angle of the ship
  let isHorizontal = angle === 0

  const { shipBlocks, valid, notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

  // if ship position is valid, add styling for 0.5 seconds
  if (valid && notTaken) {
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add('hover')
      setTimeout(() => shipBlock.classList.remove('hover'), 500)
    })
  }
}
// keep track of whether match is over
let gameOver = false
// keep track of whose turn it is
let playerTurn

// Start Game
function startGame () {
  if (playerTurn === undefined) {
    // make sure all the ship options have been placed on the gameboard before starting match
    if (optionContainer.children.length !== 0) {
      infoDisplay.textContent = 'Please place all your pieces first!'
    } else {
      const allBoardBlocks = document.querySelectorAll('#computer div')
      // make all blocks on computer gameboard listen for clicks, and act accordingly
      allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
      playerTurn = true
      // let user know it's time to make a move
      turnDisplay.textContent = 'Your Go!'
      infoDisplay.textContent = 'The game has started'
    }
  }
}
// when start button is clicked, begin match
startButton.addEventListener('click', startGame)

let playerHits = [] // keep track of ship blocks player hit
let computerHits = [] // keep track of ship blocks computer hit
const playerSunkShips = [] // keep track of ships that player sunk
const computerSunkShips = [] // keep track of ships that computer sunk

// 
function handleClick (e) {
  if (!gameOver) { // make sure match isn't over
    // if clicked block contains a ship,
    if (e.target.classList.contains('taken')) {
      // change styling of block
      e.target.classList.add('boom')
      // let user know that a ship has been hit
      infoDisplay.textContent = "You hit the computer's ship!"
      let classes = Array.from(e.target.classList)
      classes = classes.filter(className => className !== 'block')
      classes = classes.filter(className => className !== 'boom')
      classes = classes.filter(className => className !== 'taken')
      // keep track to the ship block that player hit
      playerHits.push(...classes)
      // update player score and check if match is over
      checkScore('player', playerHits, playerSunkShips)
    }

    // if clicked block contains nothing,
    if (!e.target.classList.contains('taken')) {
      // let user know
      infoDisplay.textContent = 'Nothing hit this time.'
      // and change block color
      e.target.classList.add('empty')
    }
    playerTurn = false // switch turns
    const allBoardBlocks = document.querySelectorAll('#computer div')
    // remove all event listeners from computer gameboard, so user can't click twice
    allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
    // after 3 seconds, computer will play
    setTimeout(computerGo, 300)
  }
}

function computerGo () {
  // if match isn't over yet,
  if (!gameOver) {
    // let user know it's computer's turn
    turnDisplay.textContent = 'Computers Go!'
    infoDisplay.textContent = 'The computer is thinking...'

    // wait 3 seconds...
    setTimeout(() => {
      // select a random block
      let randomGo = Math.floor(Math.random() * width * width)
      const allBoardBlocks = document.querySelectorAll('#player div')
      // if that block is has a ship and has already been hit,
      // run the function again (so that computer doesn't waste a turn)
      if (allBoardBlocks[randomGo].classList.contains('taken') &&
          allBoardBlocks[randomGo].classList.contains('boom')
      ) {
        computerGo()
        return
      } else if ( // if block has a ship but hasn't been hit,
        allBoardBlocks[randomGo].classList.contains('taken') &&
        !allBoardBlocks[randomGo].classList.contains('boom')
      ) {
        // mark the fact that it has been hit, and change block color
        allBoardBlocks[randomGo].classList.add('boom')
        // let user know that his ship was hit
        infoDisplay.textContent = 'The computer hit your ship!'
        let classes = Array.from(e.target.classList)
        classes = classes.filter(className => className !== 'block')
        classes = classes.filter(className => className !== 'boom')
        classes = classes.filter(className => className !== 'taken')
        // keep track of the hit computer made
        computerHits.push(...classes)
        // update score and check if match is over
        checkScore('computer', computerHits, computerSunkShips)
      } else {
        // if nothing was hit, let user know, and mark the spot empty
        infoDisplay.textContent = 'Nothing hit this time.'
        allBoardBlocks[randomGo].classList.add('empty')
      }
    }, 300)

    // delay 6 seconds...
    setTimeout(() => {
      playerTurn = true // switch turns
      // let user know it's his turn
      turnDisplay.textContent = 'Your Go!'
      infoDisplay.textContent = 'Please take your go.'
      const allBoardBlocks = document.querySelectorAll('#computer div')
      // reactivate the event listeners on computer gameboard so user can click on it
      allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }, 600)
  }
}

// check which ships were sunk and if match is over
function checkScore (user, userHits, userSunkShips) {
  // if a ship was sunk, update the appropriate variables, and let user know
  function checkShip (shipName, shipLength) {
    if (
      userHits.filter(storedShipName => storedShipName === shipName).length === shipLength
    ) {
      if (user === 'player') {
        infoDisplay.textContent = `you sunk the computer's ${shipName}`
        playerHits = userHits.filter(storedShipName => storedShipName !== shipName)
      }
      if (user === 'computer') {
        infoDisplay.textContent = `The computer sunk your ${shipName}`
        computerHits = userHits.filter(storedShipName => storedShipName !== shipName)
      }
      userSunkShips.push(shipName)
    }
  }

  // check if any of the 5 ships have been sunk
  checkShip('destroyer', 2)
  checkShip('submarine', 3)
  checkShip('cruiser', 3)
  checkShip('battleship', 4)
  checkShip('carrier', 5)

  console.log('playerHits', playerHits)
  console.log('playerSunkShips', playerSunkShips)

  // check if match is over and announce winner
  if (playerSunkShips.length === 5) {
    infoDisplay.textContent = 'you sunk all the computers ships. YOU WON!'
    gameOver = true
  }
  if (computerSunkShips.length === 5) {
    infoDisplay.textContent = 'the computer has sunk all your ships. YOU LOST!'
    gameOver = true
  }
}
