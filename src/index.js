import './style.css'

function Grid () {
  let marked = false

  const markGrid = () => {
    marked = true
  }

  const markedOrNot = () => marked

  return { markGrid, markedOrNot }
}

function Gameboard () {
  const rows = 10
  const columns = 10
  const board = []

  // Create a 2d array to represent the state of the game board
  for (let i = 0; i < rows; i++) {
    board[i] = []
    for (let j = 0; j < columns; j++) {
      board[i].push(Grid())
    }
  }

  const getBoard = () => board

  const receiveAttack = (row, column) => {
    if (board[row][column].markedOrNot() === false) {
      board[row][column].markGrid()
    } else {
      alert('Invalid move.')
    }
  }

  const printBoard = () => {
    const boardWithGridValues = board.map(
      (row) => row.map((grid) => grid.markedOrNot())
    )
    console.log(boardWithGridValues)
  }

  return { getBoard, receiveAttack, printBoard }
}
