// Modern Tic Tac Toe Game with Dark Mode, AI, and Scoreboard

document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('board');
    const onePlayerBtn = document.getElementById('onePlayerBtn');
    const twoPlayerBtn = document.getElementById('twoPlayerBtn');
    const difficultySelect = document.getElementById('difficultySelect');
    const difficultyDropdown = document.getElementById('difficulty');
    const restartBtn = document.getElementById('restartBtn');
    const gameStatus = document.getElementById('gameStatus');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const scoreDraw = document.getElementById('scoreDraw');
    const centered = document.querySelector('.centered');
    const container = document.querySelector('.container');

    let board, currentPlayer, gameActive, mode, aiLevel;
    let scores = { X: 0, O: 0, Draw: 0 };
    let aiTurn = false;

    function resetBoard() {
        board = Array(9).fill(null);
        currentPlayer = 'X';
        gameActive = true;
        aiTurn = false;
        renderBoard();
        gameStatus.textContent = `${currentPlayer}'s turn`;
        restartBtn.style.display = 'none';
    }

    function renderBoard() {
        boardEl.innerHTML = '';
        board.forEach((cell, idx) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'cell';
            if (cell === 'X') cellEl.classList.add('taken-x');
            if (cell === 'O') cellEl.classList.add('taken-o');
            cellEl.innerHTML = cell ? icon(cell) : '';
            cellEl.addEventListener('click', () => handleCellClick(idx));
            boardEl.appendChild(cellEl);
        });
    }

    function icon(player) {
        return player === 'X' ? '<i class="fa-solid fa-x neon-x"></i>' : '<i class="fa-solid fa-o neon-o"></i>';
    }

    function handleCellClick(idx) {
        if (!gameActive || board[idx]) return;
        if (mode === '1p' && aiTurn) return;
        board[idx] = currentPlayer;
        renderBoard();
        if (checkWin(currentPlayer)) {
            endGame(`${icon(currentPlayer)} wins!`);
            scores[currentPlayer]++;
            updateScoreboard();
        } else if (board.every(cell => cell)) {
            endGame('Draw!');
            scores.Draw++;
            updateScoreboard();
        } else {
            switchPlayer();
            if (mode === '1p' && currentPlayer === 'O') {
                aiTurn = true;
                setTimeout(aiMove, 500);
            } else {
                gameStatus.textContent = `${currentPlayer}'s turn`;
            }
        }
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }

    function endGame(msg) {
        gameActive = false;
        gameStatus.innerHTML = msg;
        restartBtn.style.display = 'inline-block';
    }

    function updateScoreboard() {
        scoreX.innerHTML = '<i class="fa-solid fa-x"></i> ' + scores.X;
        scoreO.innerHTML = '<i class="fa-solid fa-o"></i> ' + scores.O;
        scoreDraw.innerHTML = '<i class="fa-solid fa-equals"></i> ' + scores.Draw;
    }

    function checkWin(player) {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        return wins.some(line => line.every(i => board[i] === player));
    }

    // --- AI Section ---
    function aiMove() {
        let idx;
        switch (aiLevel) {
            case 'easy':
                idx = randomMove(); break;
            case 'medium':
                idx = Math.random() < 0.5 ? randomMove() : bestMove('O', 1); break;
            case 'hard':
                idx = bestMove('O', 2); break;
            case 'impossible':
                idx = bestMove('O', 9); break;
            default:
                idx = randomMove();
        }
        if (idx !== undefined) {
            board[idx] = 'O';
            renderBoard();
            if (checkWin('O')) {
                endGame(`${icon('O')} wins!`);
                scores.O++;
                updateScoreboard();
            } else if (board.every(cell => cell)) {
                endGame('Draw!');
                scores.Draw++;
                updateScoreboard();
            } else {
                currentPlayer = 'X';
                aiTurn = false;
                gameStatus.textContent = `${currentPlayer}'s turn`;
            }
        }
    }

    function randomMove() {
        const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
        return empty.length ? empty[Math.floor(Math.random()*empty.length)] : undefined;
    }

    // Minimax with depth limit for difficulty
    function bestMove(player, depthLimit) {
        let bestScore = -Infinity, move;
        board.forEach((cell, idx) => {
            if (!cell) {
                board[idx] = player;
                let score = minimax(board, 0, false, player, depthLimit);
                board[idx] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = idx;
                }
            }
        });
        return move;
    }

    function minimax(b, depth, isMax, aiPlayer, depthLimit) {
        const human = aiPlayer === 'X' ? 'O' : 'X';
        if (checkWin(aiPlayer)) return 10 - depth;
        if (checkWin(human)) return depth - 10;
        if (b.every(cell => cell)) return 0;
        if (depth >= depthLimit) return 0;
        let scores = [];
        for (let i = 0; i < 9; i++) {
            if (!b[i]) {
                b[i] = isMax ? aiPlayer : human;
                let score = minimax(b, depth+1, !isMax, aiPlayer, depthLimit);
                scores.push(score);
                b[i] = null;
            }
        }
        return isMax ? Math.max(...scores) : Math.min(...scores);
    }

    // --- UI Event Listeners ---
    onePlayerBtn.onclick = () => {
        mode = '1p';
        aiLevel = difficultyDropdown.value;
        difficultySelect.style.display = 'block';
        resetBoard();
    };
    twoPlayerBtn.onclick = () => {
        mode = '2p';
        difficultySelect.style.display = 'none';
        resetBoard();
    };
    difficultyDropdown.onchange = () => {
        aiLevel = difficultyDropdown.value;
        if (mode === '1p') resetBoard();
    };
    restartBtn.onclick = resetBoard;

    function showGame(modeType) {
        if (centered) centered.style.display = 'none';
        if (container) container.style.display = 'block';
        if (modeType === '1p') {
            mode = '1p';
            aiLevel = difficultyDropdown.value;
            difficultySelect.style.display = 'block';
        } else {
            mode = '2p';
            difficultySelect.style.display = 'none';
        }
        resetBoard();
    }

    // Attach to new starter menu buttons
    const startHumanAI = document.getElementById('startHumanAI');
    const startTwoPlayer = document.getElementById('startTwoPlayer');
    if (startHumanAI) startHumanAI.onclick = () => showGame('1p');
    if (startTwoPlayer) startTwoPlayer.onclick = () => showGame('2p');

    updateScoreboard();
});
