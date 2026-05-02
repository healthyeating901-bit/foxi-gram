// ============================================
// FOXI GRAM - MAIN APPLICATION
// ============================================

let currentPage = 'home';
let isSpinning = false;
let miningInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🦊 Foxi Gram Starting...');
    loadUserData();
    navigateTo('home');
    loadTasks('all');
    loadPromotions();
    loadMiningPlans();
    startMining();
    updateAllUI();
    checkDailyReward();
});

// USER DATA
function loadUserData() {
    const saved = localStorage.getItem('foxiUserData');
    if (saved) {
        try {
            USER_DATA = { ...USER_DATA, ...JSON.parse(saved) };
        } catch(e) {
            console.error('Error loading data:', e);
        }
    }
}

function saveUserData() {
    localStorage.setItem('foxiUserData', JSON.stringify(USER_DATA));
}

// NAVIGATION
function navigateTo(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageName + 'Page');
    if (page) page.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItems = document.querySelectorAll('.nav-item');
    const pageMap = { 'home': 0, 'games': 1, 'leaders': 2, 'tasks': 3, 'buy': 4, 'profile': 5 };
    const index = pageMap[pageName];
    if (index !== undefined && navItems[index]) navItems[index].classList.add('active');
    
    currentPage = pageName;
    window.scrollTo(0, 0);
}

// UPDATE UI
function updateAllUI() {
    const els = {
        usdtBalance: USER_DATA.usdtBalance.toFixed(2),
        hashrateBalance: USER_DATA.hashrate.toFixed(2),
        profileUsdt: USER_DATA.usdtBalance.toFixed(2) + ' USDT',
        profileHashrate: USER_DATA.hashrate.toFixed(2) + ' H/s',
        profileSpins: USER_DATA.freeSpins,
        spinsCount: USER_DATA.freeSpins + ' Spins Left',
        dailyRewardAmount: APP_CONFIG.rewards.dailyReward.toFixed(2),
        referralPercent: APP_CONFIG.rewards.referralPercent + '%',
        referralCount: USER_DATA.referrals + ' Referrals',
        referralEarnings: USER_DATA.referralEarnings.toFixed(2) + ' USDT',
    };
    
    for (const [id, value] of Object.entries(els)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    updateMiningUI();
    
    const spinBtn = document.getElementById('spinButton');
    if (spinBtn) {
        spinBtn.disabled = USER_DATA.freeSpins <= 0;
        spinBtn.style.opacity = USER_DATA.freeSpins <= 0 ? '0.5' : '1';
    }
}

// MINING
function startMining() {
    if (!APP_CONFIG.mining.enabled) return;
    if (miningInterval) clearInterval(miningInterval);
    
    miningInterval = setInterval(() => {
        if (USER_DATA.hashrate > 0) {
            const earned = USER_DATA.hashrate * APP_CONFIG.mining.usdtPerHash;
            const remaining = APP_CONFIG.mining.maxDailyMining - USER_DATA.todayMiningEarned;
            const newEarned = Math.min(earned, remaining);
            
            if (newEarned > 0) {
                USER_DATA.usdtBalance += newEarned;
                USER_DATA.todayMiningEarned += newEarned;
                USER_DATA.totalEarned += newEarned;
                updateMiningUI();
                if (Math.random() < 0.2) saveUserData();
            }
        }
    }, APP_CONFIG.mining.miningInterval);
}

function updateMiningUI() {
    const fill = document.getElementById('miningFill');
    const earned = document.getElementById('miningEarned');
    const rate = document.getElementById('miningRate');
    
    if (fill) fill.style.width = Math.min((USER_DATA.todayMiningEarned / APP_CONFIG.mining.maxDailyMining) * 100, 100) + '%';
    if (earned) earned.textContent = USER_DATA.todayMiningEarned.toFixed(4) + ' USDT';
    if (rate) rate.textContent = (USER_DATA.hashrate * APP_CONFIG.mining.usdtPerHash).toFixed(4) + ' USDT/min';
}

// MINING PLANS
function loadMiningPlans() {
    const container = document.getElementById('miningPlans');
    if (!container) return;
    
    container.innerHTML = APP_CONFIG.miningPlans.map(plan => `
        <div class="plan-card glass-card" style="margin-bottom: 15px;">
            <div class="plan-header">
                <span class="plan-icon">${plan.icon}</span>
                <div class="plan-info">
                    <h3>${plan.name}</h3>
                    <p>${plan.description}</p>
                </div>
            </div>
            <div class="plan-details">
                <div class="plan-stat">
                    <span>Hashrate</span>
                    <strong>${plan.hashrate} H/s</strong>
                </div>
                <div class="plan-stat">
                    <span>Earnings</span>
                    <strong>${plan.dailyEstimate}</strong>
                </div>
            </div>
            <div class="plan-footer">
                <span class="plan-price">${plan.price} USDT</span>
                <button class="buy-plan-btn ${plan.color}" onclick="buyMiningPlan('${plan.id}')">Buy Now</button>
            </div>
        </div>
    `).join('');
}

function buyMiningPlan(planId) {
    const plan = APP_CONFIG.miningPlans.find(p => p.id === planId);
    if (!plan) return;
    
    if (USER_DATA.usdtBalance < plan.price) {
        showToast('Insufficient USDT balance!', 'error');
        return;
    }
    
    if (confirm('Buy ' + plan.name + '?\nHashrate: ' + plan.hashrate + ' H/s\n' + plan.dailyEstimate + '\nPrice: ' + plan.price + ' USDT')) {
        USER_DATA.usdtBalance -= plan.price;
        USER_DATA.hashrate += plan.hashrate;
        
        if (!USER_DATA.purchasedPlans) USER_DATA.purchasedPlans = [];
        USER_DATA.purchasedPlans.push({
            planId: plan.id,
            planName: plan.name,
            hashrate: plan.hashrate,
            price: plan.price,
            date: new Date().toISOString()
        });
        
        saveUserData();
        updateAllUI();
        sendPromotionProof(USER_DATA.username, plan.name + ' (' + plan.hashrate + ' H/s)', plan.price);
        showToast(plan.name + ' activated! +' + plan.hashrate + ' H/s', 'success');
    }
}

// FREE SPINS
function useFreeSpin() {
    if (isSpinning) return;
    if (USER_DATA.freeSpins <= 0) {
        showToast('No free spins! Complete tasks to earn spins.', 'warning');
        return;
    }
    
    isSpinning = true;
    USER_DATA.freeSpins--;
    USER_DATA.totalSpinsUsed++;
    updateAllUI();
    
    const slots = document.querySelectorAll('#spinsSlots .slot');
    const symbols = ['🍒', '💎', '🎰', '⭐', '👑', '⛏'];
    let count = 0;
    
    const animation = setInterval(() => {
        slots.forEach(s => {
            s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            s.style.transform = 'scale(1.2)';
            setTimeout(() => s.style.transform = 'scale(1)', 50);
        });
        count++;
        if (count >= 20) {
            clearInterval(animation);
            showSpinResult(slots);
        }
    }, 100);
}

function showSpinResult(slots) {
    const rewards = APP_CONFIG.spins.spinRewards;
    const totalWeight = rewards.reduce((s, r) => s + r.weight, 0);
    let random = Math.random() * totalWeight;
    let result = rewards[0];
    
    for (const r of rewards) {
        random -= r.weight;
        if (random <= 0) { result = r; break; }
    }
    
    slots.forEach(s => {
        s.textContent = result.symbol;
        s.style.transform = 'scale(1.3)';
        setTimeout(() => s.style.transform = 'scale(1)', 200);
    });
    
    if (result.type === 'usdt') {
        USER_DATA.usdtBalance += result.reward;
        USER_DATA.totalEarned += result.reward;
    } else {
        USER_DATA.hashrate += result.reward;
    }
    
    saveUserData();
    
    if (result.reward >= 1 && result.type === 'usdt') {
        sendBigWinProof(USER_DATA.username, 'Free Spin', result.reward);
    }
    
    setTimeout(() => {
        document.getElementById('spinResultDisplay').innerHTML = `
            <div class="result-slots">
                <span class="result-slot">${result.symbol}</span>
                <span class="result-slot">${result.symbol}</span>
                <span class="result-slot">${result.symbol}</span>
            </div>`;
        document.getElementById('spinWinMessage').textContent = 'You won ' + result.reward + ' ' + result.type.toUpperCase() + '!';
        document.getElementById('spinModal').style.display = 'flex';
        showToast('Won ' + result.reward + ' ' + result.type.toUpperCase() + '!', 'success');
    }, 500);
    
    isSpinning = false;
}

function closeSpinModal() {
    document.getElementById('spinModal').style.display = 'none';
    updateAllUI();
}

// DAILY REWARD
function checkDailyReward() {
    const now = new Date();
    const last = USER_DATA.lastDailyClaim ? new Date(USER_DATA.lastDailyClaim) : null;
    const claimBtn = document.getElementById('claimBtn');
    
    if (!last || now.toDateString() !== last.toDateString()) {
        USER_DATA.dailyClaimed = false;
        if (claimBtn) { claimBtn.disabled = false; claimBtn.style.opacity = '1'; }
        document.getElementById('dailyTimer').textContent = 'Ready to claim!';
    } else {
        USER_DATA.dailyClaimed = true;
        if (claimBtn) { claimBtn.disabled = true; claimBtn.style.opacity = '0.5'; }
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const h = Math.floor((tomorrow - now) / 3600000);
        const m = Math.floor(((tomorrow - now) % 3600000) / 60000);
        document.getElementById('dailyTimer').textContent = 'Next in ' + h + 'h ' + m + 'm';
    }
    saveUserData();
}

function claimDailyReward() {
    if (USER_DATA.dailyClaimed) return;
    
    USER_DATA.usdtBalance += APP_CONFIG.rewards.dailyReward;
    USER_DATA.totalEarned += APP_CONFIG.rewards.dailyReward;
    USER_DATA.dailyClaimed = true;
    USER_DATA.lastDailyClaim = new Date().toISOString();
    USER_DATA.freeSpins += 1;
    
    saveUserData();
    updateAllUI();
    
    const btn = document.getElementById('claimBtn');
    if (btn) {
        btn.innerHTML = 'Claimed!';
        setTimeout(() => { btn.innerHTML = 'Claim +<span id="dailyRewardAmount">' + APP_CONFIG.rewards.dailyReward + '</span> USDT'; }, 2000);
    }
    
    showToast('+' + APP_CONFIG.rewards.dailyReward + ' USDT + 1 Spin!', 'success');
    checkDailyReward();
}

// TASKS
function loadTasks(category) {
    const tasks = category === 'all' ? APP_CONFIG.tasks : APP_CONFIG.tasks.filter(t => t.category === category);
    const html = tasks.map(t => createTaskCard(t)).join('') || '<p>No tasks</p>';
    
    const c = document.getElementById('tasksContainer');
    const f = document.getElementById('tasksFeed');
    if (c) c.innerHTML = html;
    if (f) f.innerHTML = html;
}

function filterTasks(category, el) {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    loadTasks(category);
}

function createTaskCard(task) {
    const done = USER_DATA.completedTasks.includes(task.id);
    return '<div class="task-card glass-card ' + (done ? 'completed' : '') + '">' +
        '<div class="task-header">' +
            '<span>' + task.icon + '</span>' +
            '<span class="task-category">' + task.category + '</span>' +
            '<span class="task-reward">+' + task.reward + ' SPINS</span>' +
        '</div>' +
        '<h3>' + task.title + '</h3>' +
        '<p>' + task.description + '</p>' +
        '<button class="task-action-btn ' + (done ? 'completed' : '') + '" onclick="completeTask(\'' + task.id + '\')" ' + (done ? 'disabled' : '') + '>' +
            (done ? 'Done' : 'Start') +
        '</button>' +
    '</div>';
}

function completeTask(id) {
    if (USER_DATA.completedTasks.includes(id)) return;
    const task = APP_CONFIG.tasks.find(t => t.id === id);
    if (!task) return;
    
    if (task.action === 'join_channel' && task.link) window.open(task.link, '_blank');
    if (task.action === 'share' && navigator.share) {
        navigator.share({ title: 'Foxi Gram', text: 'Earn USDT!', url: location.href });
    }
    
    USER_DATA.completedTasks.push(id);
    USER_DATA.freeSpins += task.reward;
    saveUserData();
    updateAllUI();
    loadTasks('all');
    showToast('+' + task.reward + ' Spins!', 'success');
}

// PROMOTIONS
function loadPromotions() {
    const c = document.getElementById('promoPackages');
    if (!c) return;
    c.innerHTML = APP_CONFIG.promotionPackages.map(p => 
        '<div class="package-card glass-card">' +
            '<div class="package-icon">' + p.icon + '</div>' +
            '<h3>' + p.name + '</h3>' +
            '<p class="package-desc">' + p.description + '</p>' +
            '<div class="package-price">' + p.price + ' ' + p.currency + '</div>' +
            '<button class="buy-btn gradient-purple" onclick="buyPromotion(\'' + p.id + '\')">Buy Now</button>' +
        '</div>'
    ).join('');
}

function buyPromotion(id) {
    const pkg = APP_CONFIG.promotionPackages.find(p => p.id === id);
    if (!pkg) return;
    if (USER_DATA.usdtBalance < pkg.price) {
        showToast('Insufficient balance!', 'error');
        return;
    }
    if (confirm('Buy ' + pkg.name + ' for ' + pkg.price + ' USDT?')) {
        USER_DATA.usdtBalance -= pkg.price;
        saveUserData();
        updateAllUI();
        sendPromotionProof(USER_DATA.username, pkg.name, pkg.price);
        showToast('Purchased ' + pkg.name + '!', 'success');
    }
}

// GAMES
function openGame(name) {
    if (name === 'crash') {
        navigateTo('crash');
    } else {
        showToast(name + ' coming soon!', 'warning');
    }
}

// DEPOSIT/WITHDRAW MODALS
function showDepositModal() { document.getElementById('depositModal').style.display = 'flex'; }
function closeDepositModal() { document.getElementById('depositModal').style.display = 'none'; }
function showWithdrawModal() { document.getElementById('withdrawModal').style.display = 'flex'; }
function closeWithdrawModal() { document.getElementById('withdrawModal').style.display = 'none'; }

function selectDeposit(type) {
    showToast('Deposit via ' + type + ' coming soon!', 'warning');
    closeDepositModal();
}

function submitWithdraw() {
    const addr = document.getElementById('withdrawAddress').value;
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (!addr) { showToast('Enter address!', 'error'); return; }
    if (!amt || amt < APP_CONFIG.withdrawals.minWithdraw) {
        showToast('Min ' + APP_CONFIG.withdrawals.minWithdraw + ' USDT', 'error');
        return;
    }
    if (amt > USER_DATA.usdtBalance) { showToast('Insufficient balance!', 'error'); return; }
    
    USER_DATA.usdtBalance -= amt;
    saveUserData();
    updateAllUI();
    sendWithdrawProof(USER_DATA.username, amt, addr);
    showToast('Withdrawal submitted!', 'success');
    closeWithdrawModal();
}

// REFERRAL
function copyReferral() {
    const input = document.getElementById('referralLink');
    input.select();
    document.execCommand('copy');
    showToast('Link copied!', 'success');
}

// TOAST
function showToast(msg, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function showNotifications() {
    showToast('Notifications coming soon!', 'warning');
}

console.log('Foxi Gram App Ready');