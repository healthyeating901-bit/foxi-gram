// ============================================
// FOXI GRAM - MINES GAME
// ============================================

let minesGame = {
    active: false,
    grid: [],
    bombCount: 3,
    betAmount: 0,
    gemsFound: 0,
    totalTiles: 25,
    bombPositions: []
};

function startMinesGame() {
    if (minesGame.active) return;
    
    const betInput = document.getElementById('minesBetAmount');
    const bombInput = document.getElementById('minesBombCount');
    
    minesGame.betAmount = parseFloat(betInput.value);
    minesGame.bombCount = parseInt(bombInput.value) || 3;
    
    if (!minesGame.betAmount || minesGame.betAmount < 0.10) {
        showToast('Minimum bet 0.10 USDT', 'error');
        return;
    }
    
    if (minesGame.betAmount > USER_DATA.usdtBalance) {
        showToast('Insufficient balance!', 'error');
        return;
    }
    
    if (minesGame.bombCount < 1 || minesGame.bombCount > 10) {
        showToast('Bombs: 1-10', 'error');
        return;
    }
    
    USER_DATA.usdtBalance -= minesGame.betAmount;
    saveUserData();
    updateAllUI();
    
    minesGame.active = true;
    minesGame.gemsFound = 0;
    minesGame.grid = [];
    minesGame.bombPositions = [];
    
    // Pick random bomb positions
    while (minesGame.bombPositions.length < minesGame.bombCount) {
        let pos = Math.floor(Math.random() * 25);
        if (!minesGame.bombPositions.includes(pos)) {
            minesGame.bombPositions.push(pos);
        }
    }
    
    // Create grid
    for (let i = 0; i < 5; i++) {
        minesGame.grid[i] = [];
        for (let j = 0; j < 5; j++) {
            let pos = i * 5 + j;
            minesGame.grid[i][j] = {
                type: minesGame.bombPositions.includes(pos) ? 'bomb' : 'gem',
                revealed: false
            };
        }
    }
    
    document.getElementById('minesStartBtn').style.display = 'none';
    document.getElementById('minesCashoutBtn').style.display = 'block';
    document.getElementById('minesStatus').textContent = 'Find gems! ' + minesGame.bombCount + ' bombs hidden';
    document.getElementById('minesResult').textContent = '';
    document.getElementById('minesGemsFound').textContent = '0';
    document.getElementById('minesCurrentWin').textContent = '0.00';
    
    renderMinesGrid();
}

function renderMinesGrid() {
    const gridEl = document.getElementById('minesGrid');
    let html = '';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            html += '<div class="mine-tile" id="mine-' + i + '-' + j + '" onclick="revealTile(' + i + ',' + j + ')">?</div>';
        }
    }
    gridEl.innerHTML = html;
}

function revealTile(row, col) {
    if (!minesGame.active) return;
    if (minesGame.grid[row][col].revealed) return;
    
    minesGame.grid[row][col].revealed = true;
    const tileEl = document.getElementById('mine-' + row + '-' + col);
    
    if (minesGame.grid[row][col].type === 'bomb') {
        // BOMB!
        tileEl.innerHTML = '💣';
        tileEl.style.background = 'rgba(255,23,68,0.5)';
        document.getElementById('minesResult').textContent = '💥 BOOM! Lost ' + minesGame.betAmount.toFixed(2) + ' USDT';
        showToast('Bomb! You lost!', 'error');
        revealAllBombs();
        endMinesGame();
    } else {
        // GEM!
        minesGame.gemsFound++;
        tileEl.innerHTML = '💎';
        tileEl.style.background = 'rgba(0,200,83,0.3)';
        document.getElementById('minesGemsFound').textContent = minesGame.gemsFound;
        
        // Calculate current win
        const safeTiles = 25 - minesGame.bombCount;
        const multiplier = (25 / safeTiles) * 1.5;
        const currentWin = minesGame.betAmount * multiplier * (minesGame.gemsFound / safeTiles);
        document.getElementById('minesCurrentWin').textContent = currentWin.toFixed(2);
    }
}

function cashOutMines() {
    if (!minesGame.active || minesGame.gemsFound === 0) return;
    
    const safeTiles = 25 - minesGame.bombCount;
    const multiplier = (25 / safeTiles) * 1.5;
    const winAmount = minesGame.betAmount * multiplier * (minesGame.gemsFound / safeTiles);
    
    USER_DATA.usdtBalance += winAmount;
    saveUserData();
    updateAllUI();
    
    document.getElementById('minesResult').textContent = '✅ Cashed Out! Won ' + winAmount.toFixed(2) + ' USDT';
    showToast('Won ' + winAmount.toFixed(2) + ' USDT!', 'success');
    
    if (winAmount >= 5) {
        sendBigWinProof(USER_DATA.username, 'Mines', winAmount.toFixed(2));
    }
    
    revealAllBombs();
    endMinesGame();
}

function revealAllBombs() {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (minesGame.grid[i] && minesGame.grid[i][j] && minesGame.grid[i][j].type === 'bomb') {
                const tileEl = document.getElementById('mine-' + i + '-' + j);
                if (tileEl) {
                    tileEl.innerHTML = '💣';
                    tileEl.style.background = 'rgba(255,23,68,0.5)';
                }
            }
        }
    }
}

function endMinesGame() {
    minesGame.active = false;
    
    setTimeout(() => {
        document.getElementById('minesStartBtn').style.display = 'block';
        document.getElementById('minesCashoutBtn').style.display = 'none';
        document.getElementById('minesStatus').textContent = 'Set bombs & place bet';
    }, 2000);
}

console.log('Mines Game Ready');