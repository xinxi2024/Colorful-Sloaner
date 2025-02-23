// 用户数据结构
const initUserData = () => ({
    username: '',
    password: '',
    completedLevels: [],
    highScores: {},
    lastPlayedLevel: null,
    achievements: {},
    levelAttempts: {},
    perfectLevels: 0,
    totalPlayTime: 0,
    items: {},
    unlockedItems: [],
    totalScore: 0,
    completedLevelsCount: 0
});

// 获取所有用户数据
function getAllUsers() {
    const users = localStorage.getItem('users');
    let parsedUsers = users ? JSON.parse(users) : {};
    
    // 检查是否需要初始化管理员账户
    if (!parsedUsers['adminx']) {
        // 创建管理员数据
        const adminData = initUserData();
        adminData.username = 'adminx';
        adminData.isAdmin = true;
        
        // 解锁所有关卡（1-50）
        adminData.completedLevels = Array.from({length: 50}, (_, i) => i + 1);
        adminData.completedLevelsCount = 50;
        
        // 解锁所有成就
        adminData.achievements = {
            novice: true,
            master: true,
            speedster: true,
            perfectionist: true,
            persistent: true,
            rookie_master: true,
            advanced_champion: true,
            challenge_conqueror: true,
            master_elite: true,
            legend_supreme: true,
            challenge_master_29: true
        };
        
        // 设置完美关卡数和总分
        adminData.perfectLevels = 50;
        adminData.totalScore = 999999;
        
        // 添加管理员账户
        parsedUsers['adminx'] = {
            password: 'adminx',
            data: adminData
        };
        
        // 保存更新后的用户数据
        localStorage.setItem('users', JSON.stringify(parsedUsers));
    }
    
    return parsedUsers;
}

// 保存所有用户数据
function saveAllUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// 注册新用户
function registerUser(username, password) {
    const users = getAllUsers();
    
    // 检查用户名是否已存在
    if (users[username]) {
        alert('用户名已存在！');
        return false;
    }
    
    // 创建新用户数据
    const userData = initUserData();
    userData.username = username;
    userData.completedLevelsCount = 0;
    userData.totalScore = 0;
    
    users[username] = {
        password: password,
        data: userData
    };
    
    // 保存用户数据
    saveAllUsers(users);
    return true;
}

// 用户登录
function loginUser(username, password) {
    const users = getAllUsers();
    const user = users[username];
    
    if (!user || user.password !== password) {
        alert('用户名或密码错误！');
        return false;
    }
    
    // 设置当前用户
    localStorage.setItem('currentUser', username);
    return true;
}

// 页面加载时检查登录状态
function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPath = window.location.pathname;
    
    // 如果用户已登录且在登录/注册页面，则重定向到游戏页面
    if (currentUser && (currentPath.endsWith('login.html') || currentPath.endsWith('register.html') || currentPath === '/index.html')) {
        window.location.href = 'game/game.html';
        return;
    }
    
    // 如果用户未登录且在游戏页面，则重定向到登录页面
    if (!currentUser && currentPath.includes('game/')) {
        window.location.href = '../index.html';
        return;
    }

    // 如果在游戏页面，显示当前用户名
    if (currentPath.includes('game/')) {
        const userElement = document.getElementById('current-user');
        const startScreenUserElement = document.getElementById('start-screen-user');
        const currentUser = localStorage.getItem('currentUser');

        if (userElement) {
            userElement.textContent = `当前用户：${currentUser}`;
        }

        if (startScreenUserElement) {
            startScreenUserElement.textContent = `当前用户：${currentUser}`;
        }

        // 添加登出按钮事件监听
        const logoutBtn = document.getElementById('logout-btn');
        const startScreenLogoutBtn = document.getElementById('start-screen-logout');

        const handleLogout = () => {
            localStorage.removeItem('currentUser');
            window.location.href = '../index.html';
        };

        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        if (startScreenLogoutBtn) {
            startScreenLogoutBtn.addEventListener('click', handleLogout);
        }
    }
}

// 在登录页面初始化
if (document.getElementById('login-btn')) {
    checkLoginStatus();
    
    document.getElementById('login-btn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('请填写完整信息！');
            return;
        }
        
        if (loginUser(username, password)) {
            // 在登录成功后启用音频
            if (typeof window.enableAudio === 'function') {
                window.enableAudio();
            }
            handleLoginSuccess(username);
        }
    });
}

// 在注册页面初始化
if (document.getElementById('register-btn')) {
    checkLoginStatus();
    
    document.getElementById('register-btn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!username || !password || !confirmPassword) {
            alert('请填写完整信息！');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        if (registerUser(username, password)) {
            // 在注册成功后启用音频
            if (typeof window.enableAudio === 'function') {
                window.enableAudio();
            }
            handleRegisterSuccess(username);
        }
    });
}

function handleLoginSuccess(username) {
    localStorage.setItem('currentUser', username);
    // 清除上一次的页面状态，确保进入开始界面
    localStorage.removeItem('lastPageState');
    window.location.href = 'game/game.html';
}

function handleRegisterSuccess(username) {
    localStorage.setItem('currentUser', username);
    // 清除上一次的页面状态，确保进入开始界面
    localStorage.removeItem('lastPageState');
    window.location.href = 'game/game.html';
}

// 页面加载完成后初始化音频
document.addEventListener('DOMContentLoaded', () => {
    // 如果在登录或注册页面，等待用户交互后再启用音频
    if (document.getElementById('login-screen') || document.getElementById('register-screen')) {
        // 添加点击事件监听器来启用音频
        document.addEventListener('click', function enableAudioOnFirstClick() {
            if (typeof window.enableAudio === 'function') {
                window.enableAudio();
                // 移除事件监听器，避免重复调用
                document.removeEventListener('click', enableAudioOnFirstClick);
            }
        });
    }
});