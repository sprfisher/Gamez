// JavaScript for "First to the Other Side Wins"

// Selectors for board and message
const boardElement = document.getElementById("board");
const messageElement = document.getElementById("message");

// Constants
const PLAYER_1 = 1; // Human Player
const PLAYER_2 = 2; // Computer
const ROWS = 8;
const COLS = 16;

// Game state
let board = [];
let currentPlayer = PLAYER_1;
let selectedPawn = null;

// Turn management
const turnSequence = [
    { player: PLAYER_1, turns: 1 },
    { player: PLAYER_2, turns: 3 },
    { player: PLAYER_1, turns: 2 },
    { player: PLAYER_2, turns: 2 },
    { player: PLAYER_1, turns: 3 },
    { player: PLAYER_2, turns: 1 },
];
let turnSequenceIndex = 0;
let remainingTurns = turnSequence[0].turns;

// Initialize the board
function initializeBoard() {
    boardElement.innerHTML = ""; // Clear the board
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    // Create grid cells
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            boardElement.appendChild(cell);
        }
    }

    // Add Player 1 pawns
    for (let col = 4; col < 12; col++) {
        addPawn(PLAYER_1, 1, col);
        addPawn(PLAYER_1, 2, col);
    }

    // Add Player 2 pawns
    for (let col = 4; col < 12; col++) {
        addPawn(PLAYER_2, 5, col);
        addPawn(PLAYER_2, 6, col);
    }

    updateMessage();
}

// Add a pawn to the board
function addPawn(player, row, col) {
    const cell = getCell(row, col);
    const pawn = document.createElement("div");
    pawn.classList.add("pawn", player === PLAYER_1 ? "player1" : "player2");
    pawn.dataset.player = player;
    pawn.dataset.row = row;
    pawn.dataset.col = col;

    if (player === PLAYER_1) {
        pawn.addEventListener("click", selectPawn);
    }

    cell.appendChild(pawn);
    board[row][col] = player;
}

// Get a cell element by row and column
function getCell(row, col) {
    return document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
}

// Select a pawn
function selectPawn(e) {
    const pawn = e.target;
    const player = parseInt(pawn.dataset.player);

    if (player !== currentPlayer) {
        messageElement.textContent = "It's not your turn!";
        return;
    }

    if (selectedPawn) {
        selectedPawn.classList.remove("selected");
    }

    selectedPawn = pawn;
    pawn.classList.add("selected");
    messageElement.textContent = `Selected Pawn at (${pawn.dataset.row}, ${pawn.dataset.col}). Choose a cell to move.`;
}

// Handle cell clicks for movement or capture
boardElement.addEventListener("click", (e) => {
    if (!selectedPawn || !e.target.classList.contains("cell")) return;

    const targetCell = e.target;
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);

    const startRow = parseInt(selectedPawn.dataset.row);
    const startCol = parseInt(selectedPawn.dataset.col);

    if (isValidMove(startRow, startCol, targetRow, targetCol)) {
        const targetPlayer = board[targetRow][targetCol];
        if (targetPlayer && targetPlayer !== currentPlayer) {
            capturePawn(selectedPawn, targetRow, targetCol);
        } else {
            movePawn(selectedPawn, startRow, startCol, targetRow, targetCol);
        }
    } else {
        messageElement.textContent = "Invalid move!";
    }
});

// Check if a move is valid
function isValidMove(startRow, startCol, targetRow, targetCol) {
    const rowDiff = targetRow - startRow;
    const colDiff = Math.abs(targetCol - startCol);

    // Forward or sideways movement
    if (
        (currentPlayer === PLAYER_1 && rowDiff === 1 && colDiff === 0) || // Forward for Player 1
        (currentPlayer === PLAYER_2 && rowDiff === -1 && colDiff === 0) || // Forward for Player 2
        (rowDiff === 0 && colDiff === 1) // Sideways for both players
    ) {
        return board[targetRow][targetCol] === null; // Cell must be empty
    }

    // Diagonal or horizontal capture
    if (
        (currentPlayer === PLAYER_1 && rowDiff === 1 && colDiff === 1) || // Diagonal capture for Player 1
        (currentPlayer === PLAYER_2 && rowDiff === -1 && colDiff === 1) || // Diagonal capture for Player 2
        (rowDiff === 0 && colDiff === 1) // Horizontal capture for both players
    ) {
        return board[targetRow][targetCol] !== null && board[targetRow][targetCol] !== currentPlayer;
    }

    return false;
}

// Capture a pawn
function capturePawn(pawn, targetRow, targetCol) {
    const enemyPawn = getCell(targetRow, targetCol).querySelector(".pawn");
    if (enemyPawn) {
        enemyPawn.remove();
        board[targetRow][targetCol] = null;
    }
    movePawn(pawn, parseInt(pawn.dataset.row), parseInt(pawn.dataset.col), targetRow, targetCol);
}

// Move a pawn
function movePawn(pawn, startRow, startCol, targetRow, targetCol) {
    const targetCell = getCell(targetRow, targetCol);
    board[startRow][startCol] = null;
    board[targetRow][targetCol] = currentPlayer;

    pawn.dataset.row = targetRow;
    pawn.dataset.col = targetCol;
    targetCell.appendChild(pawn);

    remainingTurns--;
    if (remainingTurns === 0) {
        switchTurn();
    }
}

// Switch turn
function switchTurn() {
    turnSequenceIndex = (turnSequenceIndex + 1) % turnSequence.length;
    currentPlayer = turnSequence[turnSequenceIndex].player;
    remainingTurns = turnSequence[turnSequenceIndex].turns;

    updateMessage();
}

// Update message
function updateMessage() {
    messageElement.textContent = `Player ${currentPlayer === PLAYER_1 ? "1" : "2"}'s Turn (${remainingTurns} turn(s) remaining)`;
}

// Initialize the game
initializeBoard();
