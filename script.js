const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
const resetButton = document.getElementById('resetButton'); // New Reset Button
const gameModeSelection = document.getElementById('gameModeSelection');
const symbolSelection = document.getElementById('symbolSelection');
const difficultySelection = document.getElementById('difficultySelection');
const gameContainer = document.getElementById('gameContainer');

let currentPlayer = 'X';
let playerSymbol = 'X';
let aiSymbol = 'O';
let gameMode = ''; // Will be set to 'Solo' or 'Coop'
let difficulty = ''; // AI difficulty: 'Noob', 'Meh', 'Champion'
let boardState = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Game mode selection
document.getElementById('soloMode').addEventListener('click', () => {
    gameMode = 'Solo';
    gameModeSelection.classList.remove('active');
    symbolSelection.classList.add('active');
});

document.getElementById('coopMode').addEventListener('click', () => {
    gameMode = 'Coop';
    gameModeSelection.classList.remove('active');
    symbolSelection.classList.add('active');
});

// Symbol selection
document.getElementById('chooseX').addEventListener('click', () => {
    playerSymbol = 'X';
    aiSymbol = 'O';
    symbolSelection.classList.remove('active');
    if (gameMode === 'Solo') {
        difficultySelection.classList.add('active');
    } else {
        startGame();
    }
});

document.getElementById('chooseO').addEventListener('click', () => {
    playerSymbol = 'O';
    aiSymbol = 'X';
    symbolSelection.classList.remove('active');
    if (gameMode === 'Solo') {
        difficultySelection.classList.add('active');
    } else {
        startGame();
    }
});

// AI difficulty selection
document.getElementById('noob').addEventListener('click', () => {
    difficulty = 'Noob';
    difficultySelection.classList.remove('active');
    startGame();
});

document.getElementById('meh').addEventListener('click', () => {
    difficulty = 'Meh';
    difficultySelection.classList.remove('active');
    startGame();
});

document.getElementById('champion').addEventListener('click', () => {
    difficulty = 'Champion';
    difficultySelection.classList.remove('active');
    startGame();
});

function startGame() {
    gameContainer.classList.add('active');
    currentPlayer = 'X';
    boardState = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    updateMessage();
}

function handleClick(e) {
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (boardState[cellIndex] !== '' || !isGameActive) return;

    placeMark(cell, cellIndex);
    if (checkWin(currentPlayer)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        updateMessage();

        if (gameMode === 'Solo' && currentPlayer === aiSymbol) {
            setTimeout(aiMove, 500); // Add delay for AI move
        }
    }
}

function placeMark(cell, index) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
}

function swapTurns() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function updateMessage() {
    messageElement.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin(currentPlayer) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return boardState[index] === currentPlayer;
        });
    });
}

function isDraw() {
    return boardState.every(cell => cell !== '');
}

function endGame(draw) {
    isGameActive = false;
    if (draw) {
        messageElement.textContent = 'Draw!';
    } else {
        messageElement.textContent = `Player ${currentPlayer} Wins!`;
    }
}

function aiMove() {
    let bestMove;

    if (difficulty === 'Noob') {
        bestMove = randomMove();
    } else if (difficulty === 'Meh') {
        bestMove = randomMove();
        if (Math.random() < 0.7) {
            bestMove = bestAiMove(); // 70% chance to make a good move
        }
    } else if (difficulty === 'Champion') {
        bestMove = bestAiMove(); // Unbeatable AI
    }

    if (bestMove !== undefined) {
        placeMark(cells[bestMove], bestMove);
        if (checkWin(currentPlayer)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            updateMessage();
        }
    }
}

function randomMove() {
    const availableMoves = boardState.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function bestAiMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = aiSymbol;
            let score = minimax(boardState, 0, false);
            boardState[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let scores = {
        X: -10,
        O: 10,
        tie: 0
    };

    let result = checkWinner();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = aiSymbol;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = playerSymbol;
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner() {
    for (let [a, b, c] of WINNING_COMBINATIONS) {
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return boardState.includes('') ? null : 'tie';
}

// Restart the game
restartButton.addEventListener('click', startGame);

// Reset to home screen
resetButton.addEventListener('click', () => {
    gameContainer.classList.remove('active');
    symbolSelection.classList.remove('active');
    difficultySelection.classList.remove('active');
    gameModeSelection.classList.add('active');
});
