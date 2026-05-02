// ============================================
// FOXI GRAM - MAIN APP WITH MAX ADS
// ============================================

let currentPage = 'home';
let isSpinning = false;
let miningInterval = null;
let adPopupInterval = null;

// Load Ad Settings
function getAdSettings() {
    const saved = localStorage.getItem('admin_ads');
    return saved ? JSON.parse(saved) : {
        showHome: true, showGames: true, showTasks: true,
        afterClaim: true, afterGame: true, beforeSpin: true, popup: true
    };
}

// Show Ad (simulated - replace with real AdsGram)
function showAd(type) {
    const ads = getAdSettings();
    console.log('💰 Ad shown: ' + type);
    // When you get AdsGram API key, replace this:
    // AdsGram.showAd({ type: type });
}

// Popup ads every 60 seconds
function startPopupAds() {
    const ads = getAdSettings();
    if(!ads.popup) return;
    
    adPopupInterval = setInterval(() => {
        showAd('popup');
        showToast('📢 Ad loading...', 'warning');
    }, 60000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🦊 Foxi Gram Starting...');
    loadUserData();
    loadAdminData();
    navigateTo('home');
    loadTasks('all');
    loadPromotions();
    loadMiningPlans();
    startMining();
    startPopupAds();
    updateAllUI();
    checkDailyReward();
    
    // Show home page ad
    const ads = getAdSettings();
    if(ads.showHome) setTimeout(() => showAd('banner_home'), 2000);
});

// Load admin tasks/promos into app
function loadAdminData() {
    const adminTasks = localStorage.getItem('admin_tasks');
    if(adminTasks) APP_CONFIG.tasks = JSON.parse(adminTasks);
    
    const adminPromos = localStorage.getItem('admin_promos');
    if(adminPromos) APP_CONFIG.promotionPackages = JSON.parse(adminPromos);
    
    const adminRewards = localStorage.getItem('admin_rewards');
    if(adminRewards) {
        const r = JSON.parse(adminRewards);
        if(r.dailyReward) APP_CONFIG.rewards.dailyReward = parseFloat(r.dailyReward);
        if(r.referralPercent) APP_CONFIG.rewards.referralPercent = parseInt(r.referralPercent);
        if(r.minWithdraw) APP_CONFIG.withdrawals.minWithdraw = parseFloat(r.minWithdraw);
    }
}

function loadUserData() {
    const saved = localStorage.getItem('foxiUserData');
    if (saved) {
        try { USER_DATA = { ...USER_DATA, ...JSON.parse(saved) }; }
        catch(e) { console.error('Error:', e); }
    }
}

function saveUserData() { localStorage.setItem('foxiUserData', JSON.stringify(USER_DATA)); }

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
    
    // Show ads on page navigation
    const ads = getAdSettings();
    if(pageName === 'games' && ads.showGames) setTimeout(() => showAd('banner_games'), 1000);
    if(pageName === 'tasks' && ads.showTasks) setTimeout(() => showAd('banner_tasks'), 1000);
}

function updateAllUI() {
    updateElement('usdtBalance', USER_DATA.usdtBalance.toFixed(2));
    updateElement('hashrateBalance', USER_DATA.hashrate.toFixed(2));
    updateElement('profileUsdt', USER_DATA.usdtBalance.toFixed(2) + ' USDT');
    updateElement('profileHashrate', USER_DATA.hashrate.toFixed(2) + ' H/s');
    updateElement('profileSpins', USER_DATA.freeSpins);
    updateElement('spinsCount', USER_DATA.freeSpins + ' Spins Left');
    updateElement('dailyRewardAmount', APP_CONFIG.rewards.dailyReward.toFixed(2));
    updateElement('referralPercent', APP_CONFIG.rewards.referralPercent + '%');
    updateElement('referralCount', USER_DATA.referrals + ' Referrals');
    updateElement('referralEarnings', USER_DATA.referralEarnings.toFixed(2) + ' USDT');
    updateMiningUI();
    const spinBtn = document.getElementById('spinButton');
    if (spinBtn) {
        spinBtn.disabled = USER_DATA.freeSpins <= 0;
        spinBtn.style.opacity = USER_DATA.freeSpins <= 0 ? '0.5' : '1';
    }
}

function updateElement(id, value) { const el = document.getElementById(id); if(el) el.textContent = value; }

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

function loadMiningPlans() {
    const container = document.getElementById('miningPlans');
    if (!container) return;
    container.innerHTML = APP_CONFIG.miningPlans.map(plan => 
        '<div class="plan-card glass-card"><div class="plan-header"><span class="plan-icon">' + plan.icon + '</span><div class="plan-info"><h3>' + plan.name + '</h3><p>' + plan.description + '</p></div></div><div class="plan-details"><div class="plan-stat"><span>Hashrate</span><strong>' + plan.hashrate + ' H/s</strong></div><div class="plan-stat"><span>Earnings</span><strong>' + plan.dailyEstimate + '</strong></div></div><div class="plan-footer"><span class="plan-price">' + plan.price + ' USDT</span><button class="buy-plan-btn ' + plan.color + '" onclick="buyMiningPlan(\'' + plan.id + '\')">Buy Now</button></div></div>'
    ).join('');
}

function buyMiningPlan(planId) {
    const plan = APP_CONFIG.miningPlans.find(p => p.id === planId);
    if (!plan) return;
    if (USER_DATA.usdtBalance < plan.price) { showToast('Insufficient balance!', 'error'); return; }
    if (confirm('Buy ' + plan.name + '?\n' + plan.hashrate + ' H/s\n' + plan.dailyEstimate + '\n' + plan.price + ' USDT')) {
        USER_DATA.usdtBalance -= plan.price;
        USER_DATA.hashrate += plan.hashrate;
        if (!USER_DATA.purchasedPlans) USER_DATA.purchasedPlans = [];
        USER_DATA.purchasedPlans.push({ planId: plan.id, planName: plan.name, hashrate: plan.hashrate, price: plan.price, date: new Date().toISOString() });
        saveUserData(); updateAllUI();
        sendPromotionProof(USER_DATA.username, plan.name, plan.price);
        showToast(plan.name + ' activated!', 'success');
    }
}

function useFreeSpin() {
    if (isSpinning) return;
    if (USER_DATA.freeSpins <= 0) { showToast('No spins! Do tasks.', 'warning'); return; }
    
    // Show ad before spin
    const ads = getAdSettings();
    if(ads.beforeSpin) showAd('video_before_spin');
    
    isSpinning = true;
    USER_DATA.freeSpins--;
    USER_DATA.totalSpinsUsed++;
    updateAllUI();
    const slots = document.querySelectorAll('#spinsSlots .slot');
    const symbols = ['🍒', '💎', '🎰', '⭐', '👑', '⛏'];
    let count = 0;
    const animation = setInterval(() => {
        slots.forEach(s => { s.textContent = symbols[Math.floor(Math.random() * symbols.length)]; });
        count++;
        if (count >= 20) { clearInterval(animation); showSpinResult(slots); }
    }, 100);
}

function showSpinResult(slots) {
    const rewards = APP_CONFIG.spins.spinRewards;
    const totalWeight = rewards.reduce((s, r) => s + r.weight, 0);
    let random = Math.random() * totalWeight;
    let result = rewards[0];
    for (const r of rewards) { random -= r.weight; if (random <= 0) { result = r; break; } }
    slots.forEach(s => { s.textContent = result.symbol; });
    if (result.type === 'usdt') { USER_DATA.usdtBalance += result.reward; USER_DATA.totalEarned += result.reward; }
    else { USER_DATA.hashrate += result.reward; }
    saveUserData();
    if (result.reward >= 1) sendBigWinProof(USER_DATA.username, 'Free Spin', result.reward);
    setTimeout(() => {
        document.getElementById('spinResultDisplay').innerHTML = '<div class="result-slots"><span class="result-slot">' + result.symbol + '</span><span class="result-slot">' + result.symbol + '</span><span class="result-slot">' + result.symbol + '</span></div>';
        document.getElementById('spinWinMessage').textContent = 'Won ' + result.reward + ' ' + result.type.toUpperCase() + '!';
        document.getElementById('spinModal').style.display = 'flex';
        showToast('Won ' + result.reward + '!', 'success');
    }, 500);
    isSpinning = false;
}

function closeSpinModal() { document.getElementById('spinModal').style.display = 'none'; updateAllUI(); }

function checkDailyReward() {
    const now = new Date();
    const last = USER_DATA.lastDailyClaim ? new Date(USER_DATA.lastDailyClaim) : null;
    const claimBtn = document.getElementById('claimBtn');
    if (!last || now.toDateString() !== last.toDateString()) {
        USER_DATA.dailyClaimed = false;
        if (claimBtn) { claimBtn.disabled = false; claimBtn.style.opacity = '1'; }
        document.getElementById('dailyTimer').textContent = 'Ready!';
    } else {
        USER_DATA.dailyClaimed = true;
        if (claimBtn) { claimBtn.disabled = true; claimBtn.style.opacity = '0.5'; }
        const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0);
        const h = Math.floor((tomorrow - now) / 3600000);
        document.getElementById('dailyTimer').textContent = 'Next in ' + h + 'h';
    }
    saveUserData();
}

function claimDailyReward() {
    if (USER_DATA.dailyClaimed) return;
    USER_DATA.usdtBalance += APP_CONFIG.rewards.dailyReward;
    USER_DATA.dailyClaimed = true;
    USER_DATA.lastDailyClaim = new Date().toISOString();
    USER_DATA.freeSpins += 1;
    saveUserData(); updateAllUI();
    const btn = document.getElementById('claimBtn');
    if (btn) { btn.innerHTML = 'Claimed!'; setTimeout(() => { btn.innerHTML = 'Claim +' + APP_CONFIG.rewards.dailyReward + ' USDT'; }, 2000); }
    showToast('+' + APP_CONFIG.rewards.dailyReward + ' USDT + 1 Spin!', 'success');
    
    // Show ad after claim
    const ads = getAdSettings();
    if(ads.afterClaim) setTimeout(() => showAd('video_after_claim'), 1500);
    
    checkDailyReward();
}

function loadTasks(category) {
    loadAdminData();
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
    return '<div class="task-card glass-card ' + (done ? 'completed' : '') + '"><div class="task-header"><span>' + task.icon + '</span><span class="task-category">' + task.category + '</span><span class="task-reward">+' + task.reward + ' SPINS</span></div><h3>' + task.title + '</h3><p>' + task.description + '</p><button class="task-action-btn ' + (done ? 'completed' : '') + '" onclick="completeTask(\'' + task.id + '\')" ' + (done ? 'disabled' : '') + '>' + (done ? 'Done' : 'Start') + '</button></div>';
}

function completeTask(id) {
    if (USER_DATA.completedTasks.includes(id)) return;
    const task = APP_CONFIG.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.action === 'join_channel' && task.link) window.open(task.link, '_blank');
    if (task.action === 'share' && navigator.share) navigator.share({ title: 'Foxi Gram', text: 'Earn USDT!', url: location.href });
    USER_DATA.completedTasks.push(id);
    USER_DATA.freeSpins += task.reward;
    saveUserData(); updateAllUI(); loadTasks('all');
    showToast('+' + task.reward + ' Spins!', 'success');
    showAd('rewarded_task');
}

function loadPromotions() {
    loadAdminData();
    const c = document.getElementById('promoPackages');
    if (!c) return;
    c.innerHTML = APP_CONFIG.promotionPackages.map(p => '<div class="package-card glass-card"><div class="package-icon">' + p.icon + '</div><h3>' + p.name + '</h3><p class="package-desc">' + p.description + '</p><div class="package-price">' + p.price + ' ' + (p.currency || 'USDT') + '</div><button class="buy-btn gradient-purple" onclick="buyPromotion(\'' + p.id + '\')">Buy Now</button></div>').join('');
}

function buyPromotion(id) {
    const pkg = APP_CONFIG.promotionPackages.find(p => p.id === id);
    if (!pkg) return;
    if (USER_DATA.usdtBalance < pkg.price) { showToast('Insufficient balance!', 'error'); return; }
    if (confirm('Buy ' + pkg.name + ' for ' + pkg.price + ' USDT?')) {
        USER_DATA.usdtBalance -= pkg.price;
        saveUserData(); updateAllUI();
        sendPromotionProof(USER_DATA.username, pkg.name, pkg.price);
        showToast('Purchased!', 'success');
        showAd('rewarded_purchase');
    }
}

function openGame(name) { if (name === 'crash') navigateTo('crash'); else showToast(name + ' coming soon!', 'warning'); }

function showDepositModal() { document.getElementById('depositModal').style.display = 'flex'; }
function closeDepositModal() { document.getElementById('depositModal').style.display = 'none'; }
function showWithdrawModal() { document.getElementById('withdrawModal').style.display = 'flex'; }
function closeWithdrawModal() { document.getElementById('withdrawModal').style.display = 'none'; }
function selectDeposit(type) { showToast('Coming soon!', 'warning'); closeDepositModal(); }

function submitWithdraw() {
    const addr = document.getElementById('withdrawAddress').value;
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    if (!addr) { showToast('Enter address!', 'error'); return; }
    if (!amt || amt < APP_CONFIG.withdrawals.minWithdraw) { showToast('Min ' + APP_CONFIG.withdrawals.minWithdraw + ' USDT', 'error'); return; }
    if (amt > USER_DATA.usdtBalance) { showToast('Insufficient!', 'error'); return; }
    USER_DATA.usdtBalance -= amt;
    saveUserData(); updateAllUI();
    sendWithdrawProof(USER_DATA.username, amt, addr);
    showToast('Submitted!', 'success');
    closeWithdrawModal();
}

function copyReferral() { const input = document.getElementById('referralLink'); input.select(); document.execCommand('copy'); showToast('Copied!', 'success'); }

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function showNotifications() { showToast('Coming soon!', 'warning'); }

console.log('✅ Foxi Gram Ready - Ads Maximized');
