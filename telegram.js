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
            // Try without HTML parsing
            return await sendToChannelPlain(message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        return false;
    }
}

// Fallback: send without HTML parsing
async function sendToChannelPlain(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.channelId,
                text: message
            })
        });
        const data = await response.json();
        console.log('Plain message response:', data);
        return data.ok;
    } catch (error) {
        return false;
    }
}

// ============================================
// AUTO-MESSAGE TEMPLATES
// ============================================

function sendDepositProof(username, amount, txHash) {
    const message = '🦊 FOXI GRAM - NEW DEPOSIT\n\n👤 User: ' + username + '\n💰 Amount: ' + amount + ' USDT\n📝 TX: ' + txHash + '\n📅 Date: ' + new Date().toLocaleString() + '\n\n✅ Status: Confirmed\n\n#deposit #usdt';
    sendToChannel(message);
}

function sendWithdrawProof(username, amount, walletAddress) {
    const shortWallet = walletAddress.length > 10 ? walletAddress.substring(0, 10) + '...' : walletAddress;
    const message = '🦊 FOXI GRAM - WITHDRAWAL\n\n👤 User: ' + username + '\n💸 Amount: ' + amount + ' USDT\n📤 Wallet: ' + shortWallet + '\n📅 Date: ' + new Date().toLocaleString() + '\n\n⏳ Status: Processing\n\n#withdraw #usdt';
    sendToChannel(message);
}

function sendPromotionProof(username, packageName, amount) {
    const message = '🦊 FOXI GRAM - NEW ORDER\n\n👤 User: ' + username + '\n📢 Package: ' + packageName + '\n💰 Amount: ' + amount + ' USDT\n📅 Date: ' + new Date().toLocaleString() + '\n\n✅ Status: Order Placed\n\n#promotion #order';
    sendToChannel(message);
}

function sendBigWinProof(username, game, amount) {
    const message = '🎰 FOXI GRAM - BIG WIN!\n\n👤 User: ' + username + '\n🎮 Game: ' + game + '\n🏆 Won: ' + amount + ' USDT\n📅 Date: ' + new Date().toLocaleString() + '\n\n🎉 Congratulations!\n\n#bigwin #' + game;
    sendToChannel(message);
}

// ============================================
// BROADCAST FUNCTION FOR ADMIN
// ============================================
function sendBroadcastToChannel(title, message) {
    const fullMessage = '📣 ' + title + '\n\n' + message + '\n\n📅 ' + new Date().toLocaleString() + '\n\n#broadcast #announcement';
    return sendToChannel(fullMessage);
}

console.log('📢 Telegram Bot Ready');

// Test connection
async function testBotConnection() {
    console.log('Testing bot...');
    const url = 'https://api.telegram.org/bot' + TELEGRAM_CONFIG.botToken + '/getMe';
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.ok) {
            console.log('✅ Bot connected: @' + data.result.username);
        } else {
            console.error('❌ Bot error:', data.description);
        }
    } catch (error) {
        console.error('❌ Cannot reach Telegram');
    }
}

testBotConnection();
