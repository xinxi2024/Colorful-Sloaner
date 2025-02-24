// 游戏公告系统

const gameAnnouncement = {
    version: 'v1.1',
    content: [
        "1.优化各类特殊方块特效",
        "2.优化游戏性能",
        "3.修复了通关后没有正确显示通关界面的问题",
    ]
};

// 检查是否需要显示公告
function shouldShowAnnouncement() {
    const currentUser = localStorage.getItem('currentUser');
    const hasSeenAnnouncement = localStorage.getItem(`announcement_seen_${currentUser}`);
    return !hasSeenAnnouncement;
}

// 显示公告
function showAnnouncement() {
    const announcementPanel = document.createElement('div');
    announcementPanel.className = 'announcement-panel';
    announcementPanel.innerHTML = `
        <div class="announcement-content">
            <h2>游戏更新公告 ${gameAnnouncement.version}</h2>
            <div class="announcement-text">
                ${gameAnnouncement.content.map(item => `<p>${item}</p>`).join('')}
            </div>
            <button class="close-announcement">我知道了</button>
        </div>
    `;

    document.body.appendChild(announcementPanel);

    // 添加关闭按钮事件
    const closeButton = announcementPanel.querySelector('.close-announcement');
    closeButton.addEventListener('click', () => {
        announcementPanel.remove();
        const currentUser = localStorage.getItem('currentUser');
        localStorage.setItem(`announcement_seen_${currentUser}`, 'true');
    });
}

// 重置公告状态（用于测试）
function resetAnnouncementStatus() {
    const currentUser = localStorage.getItem('currentUser');
    localStorage.removeItem(`announcement_seen_${currentUser}`);
}
