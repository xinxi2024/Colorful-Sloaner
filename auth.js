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
        parsedUsers['adminx'] = {
            password: 'adminx',
            data: {
                username: 'adminx',
                isAdmin: true,
                completedLevels: Array.from({length: 50}, (_, i) => i + 1),
                completedLevelsCount: 50,
                highScores: {},
                levelAttempts: {},
                achievements: {
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
                },
                perfectLevels: 50,
                totalScore: 999999,
                items: {
                    shuffle: 99,
                    colorBomb: 99,
                    hammer: 99,
                    cross: 99
                },
                usedItems: {}
            }
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
    if (currentUser) {
        if (currentPath.endsWith('login.html') || 
            currentPath.endsWith('register.html') || 
            currentPath.endsWith('index.html') || 
            currentPath === '/') {
            window.location.href = './game/game.html';
            return;
        }
    }
    
    // 如果用户未登录且在游戏页面，则重定向到登录页面
    if (!currentUser && currentPath.includes('/game/')) {
        window.location.href = '../index.html';
        return;
    }

    // 如果在游戏页面，设置用户界面元素
    if (currentPath.includes('/game/')) {
        // 添加用户头像点击事件
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', toggleUserPanel);
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
    localStorage.removeItem('lastPageState');
    
    // 使用相对路径
    window.location.href = './game/game.html';
}

function handleRegisterSuccess(username) {
    localStorage.setItem('currentUser', username);
    localStorage.removeItem('lastPageState');
    
    // 使用相对路径
    window.location.href = './game/game.html';
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

// 修改登出处理函数
function handleLogout() {
    // 清除所有相关的本地存储数据
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastPageState');
    localStorage.removeItem('currentGroup');
    
    // 获取当前路径信息
    const currentPath = window.location.pathname;
    
    // 确定重定向路径
    let redirectPath;
    if (currentPath.includes('/game/')) {
        // 如果在游戏目录下，返回上一级
        redirectPath = '../index.html';
    } else {
        // 如果在根目录，直接跳转到index.html
        redirectPath = './index.html';
    }
    
    // 使用相对路径进行重定向
    window.location.href = redirectPath;
}

// 修改用户面板函数
function toggleUserPanel() {
    let userPanel = document.querySelector('.user-panel');
    if (userPanel) {
        userPanel.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.className = 'user-panel';
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const users = getAllUsers();
    const userData = users[currentUser]?.data || initUserData();
    
    const totalScore = Object.values(userData.highScores || {}).reduce((a, b) => a + b, 0);
    const maxScore = Object.values(userData.highScores || {}).reduce((a, b) => Math.max(a, b), 0);
    
    panel.innerHTML = `
        <div class="user-info-content">
            <h3>用户信息</h3>
            <p>用户名：${currentUser}</p>
            <p>已完成关卡：${userData.completedLevelsCount || 0}</p>
            <p>总分：${totalScore}</p>
            <p>最高分：${maxScore}</p>
            <button class="logout-btn" onclick="handleLogout()">登出</button>
        </div>
    `;
    
    // 获取头像元素的位置
    const avatar = document.getElementById('user-avatar');
    const avatarRect = avatar.getBoundingClientRect();
    
    // 将面板添加到body中以避免定位问题
    document.body.appendChild(panel);
    
    // 设置面板的位置
    panel.style.position = 'absolute';
    panel.style.top = `${avatarRect.bottom + 5}px`;
    panel.style.left = `${avatarRect.left}px`;
    panel.style.zIndex = '1000';

    // 点击面板外区域关闭面板
    document.addEventListener('click', function closePanel(e) {
        if (!panel.contains(e.target) && e.target.id !== 'user-avatar') {
            panel.remove();
            document.removeEventListener('click', closePanel);
        }
    });
}

// 确保函数在全局范围内可用
window.handleLogout = handleLogout;
window.toggleUserPanel = toggleUserPanel;