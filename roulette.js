// ============================================
// FOXI GRAM - ROULETTE GAME
// ============================================

let rouletteSpinning = false;

function placeRouletteBet(choice) {
    if (rouletteSpinning) {
        showToast('Wait for current spin!', 'warning');
        return;
    }
    
    const betInput = document.getElementById('rouletteBetAmount');
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
    
    rouletteSpinning = true;
    document.getElementById('rouletteResult').textContent = 'Spinning...';
    
    setTimeout(() => {
        const isHouseWin = Math.random() < 0.65;
        let result;
        
        if (isHouseWin) {
            if (choice === 'red') result = Math.random() < 0.5 ? 'black' : 'green';
            else if (choice === 'black') result = Math.random() < 0.5 ? 'red' : 'green';
            else result = Math.random() < 0.5 ? 'red' : 'black';
        } else {
            result = choice;
        }
        
        let winAmount = 0;
        
        if (result === choice) {
            if (choice === 'green') {
                winAmount = betAmount * 14;
            } else {
                winAmount = betAmount * 2;
            }
            USER_DATA.usdtBalance += winAmount;
            document.getElementById('rouletteResult').textContent = result.toUpperCase() + '! Won ' + winAmount.toFixed(2) + ' USDT!';
            showToast('Won ' + winAmount.toFixed(2) + ' USDT!', 'success');
        } else {
            document.getElementById('rouletteResult').textContent = result.toUpperCase() + '! Lost ' + betAmount.toFixed(2) + ' USDT';
            showToast('Lost ' + betAmount.toFixed(2) + ' USDT', 'error');
        }
        
        saveUserData();
        updateAllUI();
        
        if (winAmount >= 5) {
            sendBigWinProof(USER_DATA.username, 'Roulette', winAmount.toFixed(2));
        }
        
        rouletteSpinning = false;
    }, 1500);
}

console.log('Roulette Game Ready');