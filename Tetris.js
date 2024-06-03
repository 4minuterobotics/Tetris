// Define constants for the Tetris game
const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;
const BOARD_COLOR = "#333";
const BLOCK_COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFFFFF",
  "#ffffff",
];

// Define Tetris game variables
let board;
let currentPiece;
let intervalId;
let score = 0;

// Tetris pieces
const tetrisPieces = [
  [
    [1, 1, 1, 1], // I
  ],
  [
    [1, 1, 1],
    [0, 1, 0], // T
  ],
  [
    [1, 1, 1],
    [1, 0, 0], // L
  ],
  [
    [1, 1, 1],
    [0, 0, 1], // J
  ],
  [
    [1, 1],
    [1, 1], // O
  ],
  [
    [0, 1, 1],
    [1, 1, 0], // S
  ],
  [
    [1, 1, 0],
    [0, 1, 1], // Z
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 0, 1],
  ],
];

// Initialize the Tetris game
function init() {
  createBoard();
  spawnPiece();
  startGame();
}

// Create the game board
function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// Start the Tetris game
function startGame() {
  // Set up game interval for moving pieces down
  intervalId = setInterval(() => {
    movePieceDown();
  }, 1000);
}

// Spawn a new Tetris piece
function spawnPiece() {
  const index = Math.floor(Math.random() * tetrisPieces.length);
  currentPiece = {
    matrix: tetrisPieces[index],
    x: Math.floor(COLS / 2) - Math.floor(tetrisPieces[index][0].length / 2),
    y: 0,
    color: BLOCK_COLORS[index],
  };
}

// Move the current piece down
function movePieceDown() {
  if (canMovePiece(0, 1)) {
    currentPiece.y++;
  } else {
    lockPiece();
    clearLines();
    spawnPiece();
    if (isGameOver()) {
      gameOver();
    }
  }
}

// Lock the current piece in place on the board
function lockPiece() {
  currentPiece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color;
      }
    });
  });
  // Update score for each piece locked
  score += 10;
}

// Clear completed lines
function clearLines() {
  for (let y = 0; y < ROWS; y++) {
    if (board[y].every((value) => value !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      // Increase score for each cleared line
      score += 100;
    }
  }
}

// Check if the game is over
function isGameOver() {
  return board[0].some((value) => value !== 0);
}

// Check if the current piece can move to a new position
function canMovePiece(dx, dy) {
  for (let y = 0; y < currentPiece.matrix.length; y++) {
    for (let x = 0; x < currentPiece.matrix[y].length; x++) {
      if (currentPiece.matrix[y][x]) {
        const newX = x + currentPiece.x + dx;
        const newY = y + currentPiece.y + dy;
        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && board[newY][newX] !== 0)
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

// Handle keyboard input for controlling the game
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      if (canMovePiece(-1, 0)) {
        currentPiece.x--;
      }
      break;
    case "ArrowRight":
      if (canMovePiece(1, 0)) {
        currentPiece.x++;
      }
      break;
    case "ArrowDown":
      if (canMovePiece(0, 1)) {
        currentPiece.y++;
      }
      break;
    case "ArrowUp":
      rotatePiece();
      break;
    default:
      break;
  }
});

// Rotate the current piece
function rotatePiece() {
  const rotatedPiece = [];
  for (let y = 0; y < currentPiece.matrix[0].length; y++) {
    rotatedPiece[y] = [];
    for (let x = 0; x < currentPiece.matrix.length; x++) {
      rotatedPiece[y][x] =
        currentPiece.matrix[currentPiece.matrix.length - 1 - x][y];
    }
  }
  // Check if the rotated piece can fit
  if (canMovePiece(0, 0, rotatedPiece)) {
    currentPiece.matrix = rotatedPiece;
  }
}

// Draw the game board and pieces
function draw() {
  const canvas = document.getElementById("tetrisCanvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the game board
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      context.fillStyle = board[y][x] === 0 ? BOARD_COLOR : board[y][x];
      context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      context.strokeStyle = "#555";
      context.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
  // Draw the current piece
  if (currentPiece) {
    currentPiece.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          context.fillStyle = currentPiece.color;
          context.fillRect(
            (currentPiece.x + x) * CELL_SIZE,
            (currentPiece.y + y) * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
          context.strokeStyle = "#555";
          context.strokeRect(
            (currentPiece.x + x) * CELL_SIZE,
            (currentPiece.y + y) * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      });
    });
  }
  // Draw the score
  context.fillStyle = "#FFF";
  context.font = "20px Arial";
  context.fillText("Score: " + score, 10, 30);
}

// Game over function
function gameOver() {
  clearInterval(intervalId);
  alert("Game Over! Your score: " + score);
  resetGame();
}

// Reset the game
function resetGame() {
  score = 0;
  createBoard();
  spawnPiece();
  startGame();
}

// Initialize the Tetris game when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  init();
  setInterval(draw, 1000 / 60); // Draw the game at 60 frames per second
});
