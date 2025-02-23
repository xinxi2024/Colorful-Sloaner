// 获取当前页面的路径，判断是否在game目录下
const isInGameDir = window.location.pathname.includes('/game/');
const audioPath = isInGameDir ? '../assets/audio/' : 'assets/audio/';

// 音频相关
const audioFiles = {
    background: new Audio(audioPath + 'background.mp3'),
    match: new Audio(audioPath + 'match.mp3'),
    swap: new Audio(audioPath + 'swap.mp3'),
    levelComplete: new Audio(audioPath + 'level-complete.mp3'),
    achievement: new Audio(audioPath + 'achievement.mp3'),
    menuBgm: new Audio(audioPath + 'menu_bgm.mp3'),
    loginBgm: new Audio(audioPath + 'login_bgm.mp3'),
    shuffle: new Audio(audioPath + 'shuffle.mp3'),
    colorBomb: new Audio(audioPath + 'color_bomb.mp3'),
    hammer: new Audio(audioPath + 'hammer.mp3'),
    cross: new Audio(audioPath + 'cross.mp3')
};

// 设置背景音乐循环播放
audioFiles.background.loop = true;
audioFiles.menuBgm.loop = true;
audioFiles.loginBgm.loop = true;

// 音频播放状态管理
let audioEnabled = false;

// 初始化音频
function initAudio() {
    // 设置所有音频的音量
    Object.values(audioFiles).forEach(audio => {
        audio.volume = 0.5;
    });
    // 背景音乐音量稍微调低
    audioFiles.background.volume = 0.3;
    audioFiles.menuBgm.volume = 0.3;
    audioFiles.loginBgm.volume = 0.3;
}

// 播放音效函数
function playSound(soundName) {
    if (!audioEnabled && (soundName === 'menuBgm' || soundName === 'loginBgm' || soundName === 'background')) {
        // 如果音频未启用，先不播放背景音乐
        return;
    }

    if (audioFiles[soundName]) {
        const sound = audioFiles[soundName];
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

// 音频启用函数
function enableAudio() {
    if (!audioEnabled) {
        audioEnabled = true;
        // 根据当前页面状态播放对应的背景音乐
        if (document.getElementById('login-screen') || document.getElementById('register-screen')) {
            playSound('loginBgm');
        } else if (document.getElementById('game-screen') && document.getElementById('game-screen').style.display === 'block') {
            playSound('background');
        } else {
            playSound('menuBgm');
        }
    }
}

// 停止所有音频
function stopAllAudio() {
    Object.values(audioFiles).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
}

// 停止背景音乐
function stopBackgroundMusic() {
    audioFiles.background.pause();
    audioFiles.menuBgm.pause();
    audioFiles.loginBgm.pause();
}

// 确保函数在全局范围内可用
window.enableAudio = enableAudio;
window.playSound = playSound;
window.stopAllAudio = stopAllAudio;
window.stopBackgroundMusic = stopBackgroundMusic; 