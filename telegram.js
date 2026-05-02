// ============================================
// FOXI GRAM - TELEGRAM BOT AUTO-MESSAGES
// ============================================

const TELEGRAM_CONFIG = {
    botToken: "8564619157:AAG3F9Lv8LdwE5AMRg00XeX8ZKPuWLtkfS0",
    channelId: "-1003930229076",
    botUsername: "@FoxigramBot",
};

// Send message to your proof channel
async function sendToChannel(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.channelId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        console.log('Telegram API Response:', data);
        
        if (data.ok) {
            console.log('✅ Message sent to channel');
            return true;
        } else {
            console.error('❌ Telegram Error:', data.description);
            return false;
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        return false;
    }
}

// ============================================
// AUTO-MESSAGE TEMPLATES
// ============================================

// When user deposits
function sendDepositProof(username, amount, txHash) {
    const message = `🦊 FOXI GRAM - NEW DEPOSIT\n\n👤 User: ${username}\n💰 Amount: ${amount} USDT\n📝 Transaction: ${txHash}\n📅 Date: ${new Date().toLocaleString()}\n\n✅ Status: Confirmed\n\n#deposit #usdt`;
    sendToChannel(message);
}

// When user withdraws
function sendWithdrawProof(username, amount, walletAddress) {
    const shortWallet = walletAddress.length > 10 ? walletAddress.substring(0, 10) + '...' : walletAddress;
    const message = `🦊 FOXI GRAM - WITHDRAWAL\n\n👤 User: ${username}\n💸 Amount: ${amount} USDT\n📤 Wallet: ${shortWallet}\n📅 Date: ${new Date().toLocaleString()}\n\n⏳ Status: Processing\n\n#withdraw #usdt`;
    sendToChannel(message);
}

// When user buys promotion
function sendPromotionProof(username, packageName, amount) {
    const message = `🦊 FOXI GRAM - NEW ORDER\n\n👤 User: ${username}\n📢 Package: ${packageName}\n💰 Amount: ${amount} USDT\n📅 Date: ${new Date().toLocaleString()}\n\n✅ Status: Order Placed\n\n#promotion #order`;
    sendToChannel(message);
}

// When user wins big
function sendBigWinProof(username, game, amount) {
    const message = `🎰 FOXI GRAM - BIG WIN!\n\n👤 User: ${username}\n🎮 Game: ${game}\n🏆 Won: ${amount} USDT\n📅 Date: ${new Date().toLocaleString()}\n\n🎉 Congratulations!\n\n#bigwin #${game}`;
    sendToChannel(message);
}

console.log('📢 Telegram Bot Auto-Messages Ready');

// TEST FUNCTION - Call this to test
async function testBotConnection() {
    console.log('Testing bot connection...');
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getMe`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Bot Info:', data);
        if (data.ok) {
            console.log('✅ Bot connected! Username:', data.result.username);
        } else {
            console.error('❌ Bot error:', data.description);
        }
    } catch (error) {
        console.error('❌ Cannot reach Telegram:', error.message);
    }
}

// Run test automatically
testBotConnection();