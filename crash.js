// ============================================
// FOXI GRAM - CRASH GAME (65% House Win)
// ============================================

let crashActive = false;
let crashMultiplier = 1.00;
let crashInterval = null;
let crashBetAmount = 0;
let crashPoint = 1.00;
let hasCashedOut = false;

function placeCrashBet() {
    if (crashActive) {
        showToast('Game in progress!', 'warning');
        return;
    }
    
    const betInput = document.getElementById('crashBetAmount');
    crashBetAmount = parseFloat(betInput.value);
    
    if (!crashBetAmount || crashBetAmount < 0.10) {
        showToast('Minimum bet 0.10 USDT', 'error');
        return;
    }
    
    if (crashBetAmount > USER_DATA.usdtBalance) {
        showToast('Insufficient balance!', 'error');
        return;
    }
    
    USER_DATA.usdtBalance -= crashBetAmount;
    saveUserData();
    updateAllUI();
    
    crashActive = true;
    hasCashedOut = false;
    crashMultiplier = 1.00;
    
    // 65% chance house wins = crash below 1.5x
    // 25% chance medium = crash 1.5x - 3x
    // 10% chance player can win big = crash above 3x
    const roll = Math.random();
    
    if (roll < 0.65) {
        // House wins - crash between 1.01x and 1.49x
        crashPoint = 1.01 + Math.random() * 0.48;
    } else if (roll < 0.90) {
        // Medium - crash between 1.5x and 3x
        crashPoint = 1.5 + Math.random() * 1.5;
    } else {
        // Player can win - crash between 3x and 50x
        crashPoint = 3.0 + Math.random() * 47;
    }
    
    console.log('Crash point: ' + crashPoint.toFixed(2) + 'x');
    
    document.getElementById('crashBetBtn').style.display = 'none';
    document.getElementById('crashCashoutBtn').style.display = 'block';
    document.getElementById('crashStatus').textContent = 'Flying...';
    document.getElementById('crashDisplay').classList.add('flying');
    
    crashInterval = setInterval(() => {
        crashMultiplier += 0.01;
        document.getElementById('crashMultiplier').textContent = crashMultiplier.toFixed(2) + 'x';
        
        const winAmount = crashBetAmount * crashMultiplier;
        document.getElementById('currentWin').textContent = winAmount.toFixed(2);
        
        const multiEl = document.getElementById('crashMultiplier');
        if (crashMultiplier >= 5) multiEl.style.color = '#ffd700';
        else if (crashMultiplier >= 2) multiEl.style.color = '#00c853';
        else multiEl.style.color = '#ffffff';
        
        if (crashMultiplier >= crashPoint) crashGame();
    }, 50);
}

function cashOutCrash() {
    if (!crashActive || hasCashedOut) return;
    hasCashedOut = true;
    clearInterval(crashInterval);
    
    const winAmount = crashBetAmount * crashMultiplier;
    USER_DATA.usdtBalance += winAmount;
    saveUserData();
    updateAllUI();
    
    document.getElementById('crashStatus').textContent = 'Cashed Out!';
    document.getElementById('crashMultiplier').style.color = '#00c853';
    addHistory(crashMultiplier, true);
    
    if (winAmount >= 5) sendBigWinProof(USER_DATA.username, 'Crash', winAmount.toFixed(2));
    showToast('Won ' + winAmount.toFixed(2) + ' USDT!', 'success');
    resetCrashGame();
}

function crashGame() {
    if (hasCashedOut) return;
    clearInterval(crashInterval);
    crashActive = false;
    
    document.getElementById('crashStatus').textContent = 'CRASHED!';
    document.getElementById('crashMultiplier').style.color = '#ff1744';
    document.getElementById('crashDisplay').classList.remove('flying');
    document.getElementById('crashDisplay').classList.add('crashed');
    addHistory(crashPoint, false);
    
    if (!hasCashedOut) showToast('Lost ' + crashBetAmount.toFixed(2) + ' USDT', 'error');
    resetCrashGame();
}

function resetCrashGame() {
    setTimeout(() => {
        crashActive = false;
        crashMultiplier = 1.00;
        document.getElementById('crashMultiplier').textContent = '1.00x';
        document.getElementById('crashMultiplier').style.color = '#ffffff';
        document.getElementById('crashStatus').textContent = 'Place your bet';
        document.getElementById('crashBetBtn').style.display = 'block';
        document.getElementById('crashCashoutBtn').style.display = 'none';
        document.getElementById('crashDisplay').classList.remove('flying', 'crashed');
    }, 2000);
}

function addHistory(multiplier, won) {
    const historyDiv = document.getElementById('crashHistory');
    const badge = document.createElement('span');
    badge.className = 'history-badge ' + (won ? 'green' : 'red');
    badge.textContent = multiplier.toFixed(2) + 'x';
    historyDiv.insertBefore(badge, historyDiv.firstChild);
    if (historyDiv.children.length > 10) historyDiv.removeChild(historyDiv.lastChild);
}

function setHalfBet() {
    const input = document.getElementById('crashBetAmount');
    input.value = (parseFloat(input.value) / 2).toFixed(2);
}

function setDoubleBet() {
    const input = document.getElementById('crashBetAmount');
    input.value = Math.min(parseFloat(input.value) * 2, USER_DATA.usdtBalance).toFixed(2);
}

console.log('Crash Game Ready (65% House)');