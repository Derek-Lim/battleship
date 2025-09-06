// Ship
export const SHIP_LENGTH_ERROR = 'Ship length must be a positive integer'

// Gameboard: receiveAttack
export const ATTACK_ARG_ERROR = 'receiveAttack expects two integer coordinates (x, y)'
export const ATTACK_BOUNDS_ERROR = 'Invalid attack: coordinates must be in bounds'

// Gameboard: placeShip
export const PLACESHIP_ARG_ERROR ='placeShip expects: Ship object, { x, y } position object, and orientation ("horizontal" | "vertical")'
export const PLACESHIP_PLACEMENT_ERROR = 'Invalid placement: ships must be within board bounds, non-overlapping, and not reused'

// Cell
export const CELL_OCCUPIED_ERROR = 'Cell already occupied'
export const CELL_ALREADY_ATTACKED_ERROR = 'Cell already attacked'

// Player
export const PLAYER_NO_MOVES_ERROR = 'No moves left for randomAttack'
