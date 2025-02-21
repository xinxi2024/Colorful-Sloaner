let currentLevel = null;
let board = [];
let score = 0;
let movesLeft = 0;
let isAnimating = false;
let timer = null;
let timeLeft = 0;
let currentUser = null;

// 更新成就系统
const achievements = {
    novice: {
        id: 'novice',
        name: '初出茅庐',
        description: '完成第一个关卡',
        icon: '🌟'
    },
    expert: {
        id: 'expert',
        name: '消除专家',
        description: '在一次消除中连接5个或更多方块',
        icon: '⭐'
    },
    master: {
        id: 'master',
        name: '消除大师',
        description: '完成10个关卡',
        icon: '👑'
    },
    speedster: {
        id: 'speedster',
        name: '闪电手',
        description: '在30秒内完成一个关卡',
        icon: '⚡'
    },
    perfectionist: {
        id: 'perfectionist',
        name: '完美主义者',
        description: '获得3个满分关卡',
        icon: '💎'
    },
    persistent: {
        id: 'persistent',
        name: '百折不挠',
        description: '在同一关卡尝试5次后成功',
        icon: '🔥'
    },
    collector: {
        id: 'collector',
        name: '收藏家',
        description: '解锁所有成就',
        icon: '🏆'
    },
    combo_master: {
        id: 'combo_master',
        name: '连击大师',
        description: '在一次移动中触发3次以上的消除',
        icon: '⚡'
    },
    time_lord: {
        id: 'time_lord',
        name: '时间领主',
        description: '完成所有限时关卡',
        icon: '⌛'
    },
    explorer: {
        id: 'explorer',
        name: '探索者',
        description: '尝试每个区域的至少一个关卡',
        icon: '🗺️'
    },
    veteran: {
        id: 'veteran',
        name: '老玩家',
        description: '游戏时间超过1小时',
        icon: '👴'
    },
    strategist: {
        id: 'strategist',
        name: '战略家',
        description: '使用最少的步数完成一个关卡',
        icon: '🎯'
    }
};

// 在文件开头添加
function showStartScreen() {
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('level-select').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    
    // 添加成就按钮
    if (!document.querySelector('.achievements-btn')) {
        const achievementsBtn = document.createElement('button');
        achievementsBtn.className = 'achievements-btn';
        achievementsBtn.innerHTML = '🏆 成就';
        achievementsBtn.addEventListener('click', showAchievementsPanel);
        document.querySelector('.start-content').appendChild(achievementsBtn);
    }
}

function showLevelSelect() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('level-select').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    
    // 清空并重新初始化关卡列表
    const levelsGrid = document.getElementById('levels-grid');
    levelsGrid.innerHTML = '';
    initLevelSelect();
}

// 修改关卡选择界面初始化
function initLevelSelect() {
    const levelsGrid = document.getElementById('levels-grid');
    levelsGrid.innerHTML = '';  // 先清空内容
    
    // 创建并添加返回按钮
    const backButton = document.createElement('button');
    backButton.className = 'back-to-home';
    backButton.innerHTML = '返回主页';
    backButton.addEventListener('click', showStartScreen);
    levelsGrid.appendChild(backButton);
    
    // 创建关卡选择容器
    const levelSelectionContainer = document.createElement('div');
    levelSelectionContainer.innerHTML = `
        <div class="level-tabs">
            <div class="level-tab active" data-group="1">新手区 1-10 <span class="level-count">10关</span></div>
            <div class="level-tab" data-group="2">进阶区 11-20 <span class="level-count">10关</span></div>
            <div class="level-tab" data-group="3">挑战区 21-30 <span class="level-count">10关</span></div>
            <div class="level-tab" data-group="4">大师区 31-40 <span class="level-count">10关</span></div>
            <div class="level-tab" data-group="5">传说区 41-50 <span class="level-count">10关</span></div>
        </div>
        <div class="level-groups"></div>
    `;
    levelsGrid.appendChild(levelSelectionContainer);

    let userData = loadUserData();
    if (!userData) {
        userData = initUser();  // 确保有初始化的用户数据
    }
    
    const levelGroups = document.querySelector('.level-groups');
    
    // 将关卡分组
    const groupedLevels = {};
    levels.forEach(level => {
        const groupIndex = Math.floor((level.id - 1) / 10) + 1;
        if (!groupedLevels[groupIndex]) {
            groupedLevels[groupIndex] = [];
        }
        groupedLevels[groupIndex].push(level);
    });

    // 创建关卡组
    Object.keys(groupedLevels).forEach(groupIndex => {
        const group = document.createElement('div');
        group.className = `level-group ${groupIndex === '1' ? 'active' : ''}`;
        group.dataset.group = groupIndex;

        groupedLevels[groupIndex].forEach(level => {
            const isCompleted = userData.completedLevels.includes(level.id);
            const isLocked = level.id > 1 && !userData.completedLevels.includes(level.id - 1);
            const highScore = userData.highScores[level.id] || 0;
            
            const levelCard = document.createElement('div');
            levelCard.className = `level-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
            levelCard.innerHTML = `
                <span class="level-difficulty difficulty-${Math.ceil(level.id / 10)}">难度 ${Math.ceil(level.id / 10)}</span>
                <h3>${level.name}</h3>
                <p>目标分数: ${level.target}</p>
                <p>${level.timeLimit ? `时间限制: ${level.timeLimit}秒` : `步数限制: ${level.moves}`}</p>
                <div class="level-stats">
                    <div>最高分: <span class="high-score">${highScore}</span></div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (highScore / level.target) * 100)}%"></div>
                    </div>
                </div>
            `;

            if (!isLocked) {
                levelCard.addEventListener('click', () => startLevel(level));
            }
            
            group.appendChild(levelCard);
        });

        levelGroups.appendChild(group);
    });

    // 添加标签切换事件
    const tabs = document.querySelectorAll('.level-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const groups = document.querySelectorAll('.level-group');
            groups.forEach(g => g.classList.remove('active'));
            document.querySelector(`.level-group[data-group="${tab.dataset.group}"]`).classList.add('active');
        });
    });
}

// 开始指定关卡
function startLevel(level) {
    currentLevel = level;
    score = 0;
    movesLeft = level.moves;
    
    // 更新UI
    document.getElementById('level-select').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('level-name').textContent = level.name;
    updateGameInfo();
    
    // 初始化游戏板
    initBoard();
}

// 更新游戏信息显示
function updateGameInfo() {
    document.getElementById('moves').textContent = `剩余步数: ${movesLeft}`;
    document.getElementById('score').textContent = `得分: ${score} / ${currentLevel.target}`;
}

// 检查游戏是否结束
function checkGameEnd() {
    const userData = loadUserData();
    const timeSpent = currentLevel.timeLimit ? currentLevel.timeLimit - timeLeft : null;
    
    if (score >= currentLevel.target) {
        stopTimer();
        updateUserProgress(currentLevel.id, score, true);
        checkAchievements(userData, currentLevel.id, score, timeSpent);
        alert('恭喜通关！');
        clearSavedGame();
        returnToLevelSelect();
    } else if (movesLeft <= 0 && !currentLevel.timeLimit) {
        stopTimer();
        updateUserProgress(currentLevel.id, score, false);
        // 更新尝试次数
        userData.levelAttempts[currentLevel.id] = (userData.levelAttempts[currentLevel.id] || 0) + 1;
        saveUserData(userData);
        alert('步数用完了，游戏结束！');
        clearSavedGame();
        returnToLevelSelect();
    }
}

// 返回关卡选择
function returnToLevelSelect() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('level-select').style.display = 'block';
}

function initBoard() {
    const size = currentLevel.gridSize;
    board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            const randomIndex = Math.floor(Math.random() * currentLevel.colors.length);
            board[i][j] = currentLevel.colors[randomIndex];
        }
    }
    renderBoard();
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    const fragment = document.createDocumentFragment();
    const size = currentLevel.gridSize;
    
    // 设置网格大小和方块大小
    boardElement.style.setProperty('--grid-size', size);
    const defaultBlockSize = 60; // 默认方块大小
    let blockSize = defaultBlockSize;
    
    // 根据关卡配置设置方块大小
    if (currentLevel.blockSize) {
        if (typeof currentLevel.blockSize === 'number') {
            blockSize = currentLevel.blockSize;
        } else if (typeof currentLevel.blockSize === 'object') {
            if (currentLevel.blockSize.dynamic) {
                blockSize = defaultBlockSize; // 动态大小使用默认值作为基准
            } else {
                blockSize = Math.floor((currentLevel.blockSize.max + currentLevel.blockSize.min) / 2);
            }
        }
    }
    
    boardElement.style.setProperty('--block-size', `${blockSize}px`);
    
    // 清空现有内容
    boardElement.innerHTML = '';
    
    // 创建网格单元格
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.value = cell;
            cellElement.dataset.row = i;
            cellElement.dataset.col = j;
            
            // 设置背景色
            cellElement.style.backgroundColor = cell;
            
            // 添加特效类
            if (currentLevel.features) {
                Object.keys(currentLevel.features).forEach(feature => {
                    if (currentLevel.features[feature]) {
                        cellElement.classList.add(feature);
                    }
                });
            }
            
            // 处理不规则大小
            if (currentLevel.blockSize && typeof currentLevel.blockSize === 'object') {
                if (currentLevel.blockSize.dynamic) {
                    cellElement.classList.add('dynamic');
                } else {
                    const randomSize = Math.floor(
                        Math.random() * 
                        (currentLevel.blockSize.max - currentLevel.blockSize.min) + 
                        currentLevel.blockSize.min
                    );
                    cellElement.style.setProperty('--block-size', `${randomSize}px`);
                }
            }
            
            // 设置方块索引（用于不规则大小计算）
            cellElement.style.setProperty('--block-index', i * size + j);
            
            cellElement.addEventListener('click', handleCellClick);
            fragment.appendChild(cellElement);
        });
    });
    
    // 使用 requestAnimationFrame 优化渲染
    requestAnimationFrame(() => {
        boardElement.appendChild(fragment);
    });
}

let selectedCell = null;

function handleCellClick(event) {
    if (isAnimating || movesLeft <= 0) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('selected'));
    
    if (selectedCell) {
        const selectedRow = selectedCell.row;
        const selectedCol = selectedCell.col;
        if (Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1) {
            swapCells(selectedRow, selectedCol, row, col).then(() => {
                movesLeft--;  // 每次移动都减少步数
                updateGameInfo();
                if (checkMatches()) {
                    eliminateMatches();
                    setTimeout(() => fillBoard(), 500);
                }
            });
        }
        selectedCell = null;
    } else {
        selectedCell = { row, col };
        event.target.classList.add('selected');
    }
}

async function swapCells(row1, col1, row2, col2) {
    isAnimating = true;
    
    const cell1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
    const cell2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    
    if (!cell1 || !cell2) return;
    
    // 保存原始位置
    const rect1 = cell1.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();
    
    // 计算位移
    const deltaX = rect2.left - rect1.left;
    const deltaY = rect2.top - rect1.top;
    
    // 应用动画
    cell1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    cell2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 交换数据
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    
    // 使用 requestAnimationFrame 优化渲染
    requestAnimationFrame(() => {
        renderBoard();
        isAnimating = false;
    });
}

function checkMatches() {
    const size = currentLevel.gridSize;
    // 横向检测
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - 2; j++) {
            if (board[i][j] && board[i][j] === board[i][j+1] && board[i][j] === board[i][j+2]) {
                return true;
            }
        }
    }
    // 纵向检测
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size - 2; i++) {
            if (board[i][j] && board[i][j] === board[i+1][j] && board[i][j] === board[i+2][j]) {
                return true;
            }
        }
    }
    return false;
}

function eliminateMatches() {
    let toEliminate = new Set();
    const size = currentLevel.gridSize;
    
    // 横向检测
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - 2; j++) {
            if (board[i][j] && board[i][j] === board[i][j+1] && board[i][j] === board[i][j+2]) {
                toEliminate.add(`${i},${j}`);
                toEliminate.add(`${i},${j+1}`);
                toEliminate.add(`${i},${j+2}`);
            }
        }
    }
    
    // 纵向检测
    for (let j = 0; j < size; j++) {
        for (let i = 0; i < size - 2; i++) {
            if (board[i][j] && board[i][j] === board[i+1][j] && board[i][j] === board[i+2][j]) {
                toEliminate.add(`${i},${j}`);
                toEliminate.add(`${i+1},${j}`);
                toEliminate.add(`${i+2},${j}`);
            }
        }
    }
    
    toEliminate.forEach(coord => {
        const [row, col] = coord.split(',').map(Number);
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('matched');
        }
        board[row][col] = null;
    });
    
    score += toEliminate.size;
    updateGameInfo();
    checkGameEnd();
}

async function fillBoard() {
    isAnimating = true;
    const cells = [];
    const size = currentLevel.gridSize;
    
    // 记录所有需要下落的方块的初始位置
    for (let j = 0; j < size; j++) {
        let emptyRow = size - 1;
        for (let i = size - 1; i >= 0; i--) {
            if (board[i][j] === null) {
                // 找到上方最近的非空方块
                let foundBlock = false;
                for (let k = i - 1; k >= 0; k--) {
                    if (board[k][j] !== null) {
                        cells.push({
                            fromRow: k,
                            fromCol: j,
                            toRow: i,
                            toCol: j,
                            value: board[k][j]
                        });
                        board[k][j] = null;
                        foundBlock = true;
                        break;
                    }
                }
                // 如果上方没有方块，则需要生成新方块
                if (!foundBlock) {
                    const randomIndex = Math.floor(Math.random() * currentLevel.colors.length);
                    board[i][j] = currentLevel.colors[randomIndex];
                }
            }
        }
    }
    
    // 创建下落动画
    const promises = cells.map(cell => {
        const element = document.querySelector(`[data-row="${cell.fromRow}"][data-col="${cell.fromCol}"]`);
        if (element) {
            element.style.zIndex = '1';
            element.style.transform = `translateY(${(cell.toRow - cell.fromRow) * 64}px)`;
            return new Promise(resolve => {
                element.addEventListener('transitionend', resolve, { once: true });
            });
        }
        return Promise.resolve();
    });
    
    // 等待所有下落动画完成
    await Promise.all(promises);
    
    // 更新数据和渲染
    cells.forEach(cell => {
        board[cell.toRow][cell.toCol] = cell.value;
    });
    
    // 确保所有空位都被填充
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (board[i][j] === null) {
                const randomIndex = Math.floor(Math.random() * currentLevel.colors.length);
                board[i][j] = currentLevel.colors[randomIndex];
            }
        }
    }
    
    requestAnimationFrame(() => {
        renderBoard();
        setTimeout(() => {
            isAnimating = false;
            if (checkMatches()) {
                eliminateMatches();
                setTimeout(() => fillBoard(), 300);
            }
        }, 50);
    });
}

// 修改初始化代码（文件末尾）
document.getElementById('start-btn').addEventListener('click', () => {
    initUser(); // 初始化用户数据
    
    // 检查是否有存档
    if (loadGame()) {
        const continueGame = confirm('检测到游戏存档，是否继续上次的游戏？');
        if (continueGame) {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('game-screen').style.display = 'block';
            return;
        } else {
            clearSavedGame();
        }
    }
    showLevelSelect();
});
document.getElementById('restart-btn').addEventListener('click', () => startLevel(currentLevel));
document.getElementById('back-btn').addEventListener('click', returnToLevelSelect);

// 初始显示开始界面
showStartScreen();

// 用户系统相关函数
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function initUser() {
    currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        currentUser = generateUserId();
        localStorage.setItem('currentUser', currentUser);
    }
    
    let userData = loadUserData();
    if (!userData) {
        // 初始化用户数据
        userData = {
            completedLevels: [],
            highScores: {},
            lastPlayedLevel: null,
            achievements: {},
            levelAttempts: {},
            perfectLevels: 0,
            totalPlayTime: 0
        };
        saveUserData(userData);
    }
    return userData;
}

function loadUserData() {
    const userData = localStorage.getItem(`userData_${currentUser}`);
    return userData ? JSON.parse(userData) : null;
}

function saveUserData(data) {
    localStorage.setItem(`userData_${currentUser}`, JSON.stringify(data));
}

function updateUserProgress(levelId, score, completed) {
    let userData = loadUserData();
    if (!userData) {
        userData = {
            completedLevels: [],
            highScores: {},
            lastPlayedLevel: null,
            achievements: {},
            levelAttempts: {},
            perfectLevels: 0,
            totalPlayTime: 0
        };
    }

    // 更新完成状态
    if (completed && !userData.completedLevels.includes(levelId)) {
        userData.completedLevels.push(levelId);
        userData.completedLevels.sort((a, b) => a - b); // 保持有序
    }

    // 更新最高分
    if (!userData.highScores[levelId] || score > userData.highScores[levelId]) {
        userData.highScores[levelId] = score;
    }

    // 更新最后玩过的关卡
    userData.lastPlayedLevel = levelId;

    // 保存更新后的数据
    saveUserData(userData);
}

// 修改存档系统
function saveGame() {
    const gameState = {
        currentLevel: currentLevel,
        board: board,
        score: score,
        movesLeft: movesLeft,
        timeLeft: timeLeft
    };
    localStorage.setItem(`savedGame_${currentUser}`, JSON.stringify(gameState));
}

function loadGame() {
    const savedGame = localStorage.getItem(`savedGame_${currentUser}`);
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        currentLevel = gameState.currentLevel;
        board = gameState.board;
        score = gameState.score;
        movesLeft = gameState.movesLeft;
        timeLeft = gameState.timeLeft;
        
        updateGameInfo();
        renderBoard();
        
        if (currentLevel.timeLimit) {
            startTimer();
        }
        
        return true;
    }
    return false;
}

function clearSavedGame() {
    localStorage.removeItem(`savedGame_${currentUser}`);
}

function startTimer() {
    if (timer) clearInterval(timer);
    timeLeft = currentLevel.timeLimit;
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateGameInfo();
        } else {
            stopTimer();
            checkGameEnd();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// 添加成就显示UI
function showAchievement(achievement) {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-notification';
    achievementElement.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">解锁成就：${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
        </div>
    `;
    document.body.appendChild(achievementElement);
    
    // 自动移除通知
    setTimeout(() => {
        achievementElement.classList.add('fade-out');
        setTimeout(() => achievementElement.remove(), 500);
    }, 3000);
}

// 检查并更新成就
function checkAchievements(userData, levelId, score, timeSpent) {
    // 确保 userData 和其属性存在
    if (!userData || !userData.completedLevels || !userData.achievements) {
        userData = {
            completedLevels: [],
            achievements: {},
            levelAttempts: {},
            perfectLevels: 0,
            highScores: {}
        };
    }
    
    const newAchievements = [];
    
    // 检查"初出茅庐"成就
    if (!userData.achievements.novice && userData.completedLevels.length > 0) {
        userData.achievements.novice = true;
        newAchievements.push(achievements.novice);
    }
    
    // 检查"消除大师"成就
    if (!userData.achievements.master && userData.completedLevels.length >= 10) {
        userData.achievements.master = true;
        newAchievements.push(achievements.master);
    }
    
    // 检查"闪电手"成就
    if (!userData.achievements.speedster && timeSpent && timeSpent <= 30) {
        userData.achievements.speedster = true;
        newAchievements.push(achievements.speedster);
    }
    
    // 检查"完美主义者"成就
    if (score === currentLevel.target) {
        userData.perfectLevels = (userData.perfectLevels || 0) + 1;
        if (!userData.achievements.perfectionist && userData.perfectLevels >= 3) {
            userData.achievements.perfectionist = true;
            newAchievements.push(achievements.perfectionist);
        }
    }
    
    // 检查"百折不挠"成就
    if (!userData.levelAttempts[levelId]) {
        userData.levelAttempts[levelId] = 0;
    }
    if (!userData.achievements.persistent && userData.levelAttempts[levelId] >= 5) {
        userData.achievements.persistent = true;
        newAchievements.push(achievements.persistent);
    }
    
    // 保存更新后的用户数据
    saveUserData(userData);
    
    // 显示新解锁的成就
    newAchievements.forEach(achievement => showAchievement(achievement));
}

// 添加成就展示界面
function showAchievementsPanel() {
    const userData = loadUserData() || { achievements: {} };  // 确保有默认值
    const achievementsPanel = document.createElement('div');
    achievementsPanel.className = 'achievements-panel';
    achievementsPanel.innerHTML = `
        <div class="achievements-header">
            <h2>我的成就</h2>
            <button class="close-btn">×</button>
        </div>
        <div class="achievements-list">
            ${Object.values(achievements).map(achievement => `
                <div class="achievement-item ${userData.achievements[achievement.id] ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                    </div>
                    ${userData.achievements[achievement.id] ? '<div class="achievement-unlocked">✓</div>' : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(achievementsPanel);
    
    achievementsPanel.querySelector('.close-btn').addEventListener('click', () => {
        achievementsPanel.remove();
    });
}