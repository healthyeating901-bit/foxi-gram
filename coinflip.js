// ============================================
// FOXI GRAM - COINFLIP GAME (65% House)
// ============================================

let coinflipActive = false;

function flipCoin(choice) {
    if (coinflipActive) {
        showToast('Wait for current flip!', 'warning');
        return;
    }
    
    const betInput = document.getElementById('coinflipBetAmount');
    const betAmount = parseFloat(betInput.value);
    
    if (!betAmount || betAmount < 0.10) {
        showToast('Minimum bet 0.10 USDT', 'error');
        return;
    }
    
    if (betAmount > USER_DATA.usdtBalance) {
        showToast('Insufficient balance!', 'error');
        return;
    }
    
    USER_DATA.usdtBalance -= betAmount;
    saveUserData();
    updateAllUI();
    
    coinflipActive = true;
    
    const coin = document.getElementById('coinflipCoin');
    const resultEl = document.getElementById('coinflipResult');
    resultEl.textContent = 'Flipping...';
    coin.textContent = '🪙';
    
    // Animate
    let flips = 0;
    const flipAnim = setInterval(() => {
        coin.textContent = flips % 2 === 0 ? '👤' : '🦊';
        flips++;
        if (flips >= 10) {
            clearInterval(flipAnim);
            showResult(choice, betAmount, coin, resultEl);
        }
    }, 100);
}

function showResult(choice, betAmount, coin, resultEl) {
    // 65% house wins
    const houseWins = Math.random() < 0.65;
    let result;
    
    if (houseWins) {
        result = choice === 'heads' ? 'tails' : 'heads';
    } else {
        result = choice;
    }
    
    coin.textContent = result === 'heads' ? '👤' : '🦊';
    
    if (result === choice) {
        const winAmount = betAmount * 2;
        USER_DATA.usdtBalance += winAmount;
        resultEl.textContent = 'You Win! +' + winAmount.toFixed(2) + ' USDT';
        showToast('Won ' + winAmount.toFixed(2) + ' USDT!', 'success');
        if (winAmount >= 5) {
            sendBigWinProof(USER_DATA.username, 'Coinflip', winAmount.toFixed(2));
        }
    } else {
        resultEl.textContent = 'You Lose! -' + betAmount.toFixed(2) + ' USDT';
        showToast('Lost ' + betAmount.toFixed(2) + ' USDT', 'error');
    }
    
    saveUserData();
    updateAllUI();
    coinflipActive = false;
}

console.log('Coinflip Game Ready');