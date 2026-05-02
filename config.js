// ============================================
// FOXI GRAM - FIREBASE CONFIGURATION
// ============================================

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2YqRmVLCMrt6OCztzIla4fvVcSpIFSBY",
  authDomain: "foxi-gram.firebaseapp.com",
  projectId: "foxi-gram",
  storageBucket: "foxi-gram.firebasestorage.app",
  messagingSenderId: "347529901873",
  appId: "1:347529901873:web:4baf1568c839699bb3e210"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log('🔥 Firebase Connected');

// ============================================
// APP CONFIGURATION (Admin Controlled)
// ============================================
const APP_CONFIG = {
    appName: "Foxi Gram",
    appVersion: "1.0.0",
    
    rewards: {
        dailyReward: 0.50,
        taskSpinReward: 1,
        referralPercent: 10,
        referralBonus: 1.00,
    },
    
    mining: {
        enabled: true,
        baseHashrate: 1.0,
        usdtPerHash: 0.0001,
        maxDailyMining: 5.00,
        miningInterval: 60000,
    },
    
    // MINING PLANS - Admin Controlled
    miningPlans: [
        { 
            id: "plan1", 
            name: "Bronze Plan", 
            icon: "🥉", 
            price: 5, 
            hashrate: 10, 
            description: "10 H/s mining power",
            dailyEstimate: "0.86 USDT/day",
            color: "gradient-orange"
        },
        { 
            id: "plan2", 
            name: "Silver Plan", 
            icon: "🥈", 
            price: 15, 
            hashrate: 50, 
            description: "50 H/s mining power",
            dailyEstimate: "4.32 USDT/day",
            color: "gradient-blue"
        },
        { 
            id: "plan3", 
            name: "Gold Plan", 
            icon: "🥇", 
            price: 50, 
            hashrate: 200, 
            description: "200 H/s mining power",
            dailyEstimate: "17.28 USDT/day",
            color: "gradient-purple"
        },
        { 
            id: "plan4", 
            name: "Diamond Plan", 
            icon: "💎", 
            price: 100, 
            hashrate: 500, 
            description: "500 H/s mining power",
            dailyEstimate: "43.20 USDT/day",
            color: "gradient-purple"
        },
    ],
    
    spins: {
        maxSpinsPerDay: 5,
        spinRewards: [
            { symbol: "🍒", reward: 0.10, type: "usdt", weight: 40 },
            { symbol: "💎", reward: 0.25, type: "usdt", weight: 25 },
            { symbol: "🎰", reward: 0.50, type: "usdt", weight: 15 },
            { symbol: "⭐", reward: 1.00, type: "usdt", weight: 10 },
            { symbol: "👑", reward: 5.00, type: "usdt", weight: 5 },
            { symbol: "⛏", reward: 0.5, type: "hashrate", weight: 5 },
        ],
    },
    
    games: {
        crash: { enabled: true, minBet: 0.10, maxBet: 100, houseEdge: 5 },
        roulette: { enabled: true, minBet: 0.10, maxBet: 50, houseEdge: 2.7 },
        mines: { enabled: true, minBet: 0.10, maxBet: 50, gridSize: 5 },
        coinflip: { enabled: true, minBet: 0.10, maxBet: 25, houseEdge: 0 },
    },
    
    tasks: [
        { id: "task1", category: "daily", title: "Daily Login", description: "Login daily to earn free spins", reward: 1, rewardType: "spins", action: "login", link: "", icon: "🔑" },
        { id: "task2", category: "bonus", title: "Invite 3 Friends", description: "Share your referral link", reward: 3, rewardType: "spins", action: "invite", link: "", icon: "👥" },
        { id: "task3", category: "partner", title: "Join Partner Channel", description: "Subscribe to earn spins", reward: 2, rewardType: "spins", action: "join_channel", link: "https://t.me/example", icon: "📢" },
        { id: "task4", category: "bonus", title: "Play Crash Game", description: "Play 1 round of Crash", reward: 1, rewardType: "spins", action: "play_game", link: "", icon: "🎮" },
        { id: "task5", category: "daily", title: "Share App", description: "Share Foxi Gram with friends", reward: 2, rewardType: "spins", action: "share", link: "", icon: "📤" },
    ],
    
    promotionPackages: [
        { id: "promo1", name: "100 Followers", description: "Real Telegram followers", price: 2.00, currency: "USDT", type: "followers", icon: "👥" },
        { id: "promo2", name: "500 Followers", description: "Real Telegram followers", price: 8.00, currency: "USDT", type: "followers", icon: "👥" },
        { id: "promo3", name: "Channel Post", description: "Promote in our channel", price: 5.00, currency: "USDT", type: "post", icon: "📢" },
        { id: "promo4", name: "Pinned Message", description: "Pin in our group (24h)", price: 10.00, currency: "USDT", type: "pin", icon: "📌" },
    ],
    
    withdrawals: {
        minWithdraw: 1.00,
        maxWithdraw: 1000,
        fee: 0,
        network: "TRC20",
    },
};

// ============================================
// USER DATA
// ============================================
let USER_DATA = {
    id: "user123",
    username: "FoxiUser",
    firstName: "User",
    usdtBalance: 0.00,
    hashrate: 1.0,
    freeSpins: 5,
    totalEarned: 0.00,
    totalSpinsUsed: 0,
    referrals: 0,
    referralEarnings: 0.00,
    dailyClaimed: false,
    lastDailyClaim: null,
    lastMiningTime: Date.now(),
    todayMiningEarned: 0.00,
    completedTasks: [],
    spinHistory: [],
    purchasedPlans: [],
};

console.log('✅ Foxi Gram Config Loaded');