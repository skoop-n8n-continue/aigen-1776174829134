/**
 * Tic-Tac-Toe Game Logic
 * Skoop Agent
 */

const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const aiToggle = document.getElementById('ai-toggle');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // X is human, O is AI
let gameActive = true;
let idleTimer;
let isDemoMode = false;

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize Game
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            resetIdleTimer();
            handleCellClick(e);
        });
    });
    resetBtn.addEventListener('click', () => {
        resetIdleTimer();
        stopDemoMode();
        resetGame();
    });

    resetIdleTimer();
}

function resetIdleTimer() {
    clearTimeout(idleTimer);
    if (!isDemoMode) {
        idleTimer = setTimeout(startDemoMode, 30000); // 30 seconds of inactivity starts demo
    }
}

function startDemoMode() {
    isDemoMode = true;
    statusElement.innerText = "Demo Mode - Autoplay";
    if (!gameActive) {
        resetGame();
    }
    autoPlayLoop();
}

function stopDemoMode() {
    isDemoMode = false;
    clearTimeout(idleTimer);
}

function autoPlayLoop() {
    if (!isDemoMode) return;

    if (!gameActive) {
        setTimeout(() => {
            if (isDemoMode) {
                resetGame();
                statusElement.innerText = "Demo Mode - Autoplay";
                autoPlayLoop();
            }
        }, 3000);
        return;
    }

    // Pick a move
    const availSpots = board.reduce((acc, cell, idx) => {
        if (cell === '') acc.push(idx);
        return acc;
    }, []);

    if (availSpots.length > 0) {
        const randomIndex = availSpots[Math.floor(Math.random() * availSpots.length)];
        makeMove(randomIndex, currentPlayer);
        setTimeout(autoPlayLoop, 1500);
    }
}

function handleCellClick(e) {
    if (isDemoMode) stopDemoMode();
    const index = e.target.getAttribute('data-index');

    if (board[index] !== '' || !gameActive || (currentPlayer === 'O' && aiToggle.checked)) {
        return;
    }

    makeMove(index, 'X');

    if (gameActive && aiToggle.checked) {
        statusElement.innerText = "AI is thinking...";
        setTimeout(makeAiMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.innerText = player;
    cell.classList.add(player.toLowerCase());

    if (checkWin(board, player)) {
        endGame(false, player);
    } else if (checkDraw(board)) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusElement.innerText = `Player ${currentPlayer}'s Turn`;
    }
}

function makeAiMove() {
    if (!gameActive) return;

    const bestMove = minimax(board, 'O').index;
    makeMove(bestMove, 'O');
}

function checkWin(currentBoard, player) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return currentBoard[index] === player;
        });
    });
}

function checkDraw(currentBoard) {
    return currentBoard.every(cell => cell !== '');
}

function endGame(draw, winner = null) {
    gameActive = false;
    if (draw) {
        statusElement.innerText = "It's a Draw!";
    } else {
        statusElement.innerText = `Player ${winner} Wins!`;
        highlightWinner(winner);
    }
}

function highlightWinner(winner) {
    WINNING_COMBINATIONS.forEach(combination => {
        if (combination.every(index => board[index] === winner)) {
            combination.forEach(index => {
                cells[index].classList.add('winner');
            });
        }
    });
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusElement.innerText = "Player X's Turn";
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('x', 'o', 'winner');
    });
}

// Minimax Algorithm for unbeatable AI
function minimax(newBoard, player) {
    const availSpots = newBoard.reduce((acc, cell, idx) => {
        if (cell === '') acc.push(idx);
        return acc;
    }, []);

    if (checkWin(newBoard, 'X')) {
        return { score: -10 };
    } else if (checkWin(newBoard, 'O')) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

init();
