class GameHistory {
    constructor() {
        this.maxRecentGames = 5;
        this.recentGames = this.getRecentGames();
        this.initializeEventListeners();
        this.renderRecentGames();
    }

    getRecentGames() {
        const games = localStorage.getItem('recentGames');
        return games ? JSON.parse(games) : [];
    }

    saveRecentGames() {
        localStorage.setItem('recentGames', JSON.stringify(this.recentGames));
    }

    addRecentGame(gameId, title, href, iconSvg) {
        // 移除已存在的相同游戏
        this.recentGames = this.recentGames.filter(game => game.id !== gameId);
        
        // 添加到开头
        this.recentGames.unshift({
            id: gameId,
            title: title,
            href: href,
            iconSvg: iconSvg
        });

        // 保持最大数量限制
        if (this.recentGames.length > this.maxRecentGames) {
            this.recentGames.pop();
        }

        this.saveRecentGames();
        this.renderRecentGames();
    }

    renderRecentGames() {
        const container = document.querySelector('.recent-games-list');
        if (!container) return;

        container.innerHTML = this.recentGames.map(game => `
            <a href="${game.href}" class="recent-game-item" data-game-id="${game.id}">
                <div class="game-icon">
                    ${game.iconSvg}
                </div>
                <h3>${game.title}</h3>
            </a>
        `).join('');
    }

    initializeEventListeners() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = card.dataset.gameId;
                const title = card.querySelector('h3').textContent;
                const href = card.href;
                const iconSvg = card.querySelector('.game-icon svg').outerHTML;
                
                this.addRecentGame(gameId, title, href, iconSvg);
            });
        });
    }
}

// 添加搜索功能
class GameSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearButton = document.getElementById('clearSearch');
        this.gameGrid = document.getElementById('gameGrid');
        this.gameCards = this.gameGrid.querySelectorAll('.game-card');
        
        // 初始化游戏标题的拼音映射
        this.initializePinyinMap();
        this.initializeSearch();
    }

    initializePinyinMap() {
        this.gameCards.forEach(card => {
            const title = card.querySelector('h3').textContent;
            // 使用正确的 pinyin-pro API
            const titlePinyin = pinyinPro.pinyin(title, { toneType: 'none', type: 'string' }).replace(/\s/g, '');
            const titlePinyinFirst = pinyinPro.pinyin(title, { pattern: 'first', toneType: 'none' });
            
            // 将拼音信息存储在卡片元素上
            card.dataset.pinyin = titlePinyin.toLowerCase();
            card.dataset.pinyinFirst = titlePinyinFirst.toLowerCase();
        });
    }

    initializeSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.handleSearch(searchTerm);
            this.toggleClearButton(searchTerm);
        });

        this.clearButton.addEventListener('click', () => {
            this.searchInput.value = '';
            this.handleSearch('');
            this.toggleClearButton('');
            this.searchInput.focus();
        });

        if ('vibrate' in navigator) {
            this.clearButton.addEventListener('touchstart', () => {
                navigator.vibrate(10);
            });
        }
    }

    handleSearch(searchTerm) {
        let hasResults = false;
        let allHidden = true;  // 添加标记来检查是否所有卡片都被隐藏

        this.gameCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const pinyin = card.dataset.pinyin;
            const pinyinFirst = card.dataset.pinyinFirst;
            
            if (title.includes(searchTerm) || 
                pinyin.includes(searchTerm) || 
                pinyinFirst.includes(searchTerm)) {
                card.classList.remove('hidden');
                hasResults = true;
                allHidden = false;  // 有显示的卡片，设置为 false
                
                // 如果是拼音搜索，添拼音提示
                if (searchTerm && !title.includes(searchTerm)) {
                    this.showPinyinHint(card, title, pinyin);
                } else {
                    this.removePinyinHint(card);
                }
            } else {
                card.classList.add('hidden');
            }
        });

        // 显示/隐藏游戏状态提示
        const gameStatus = this.gameGrid.querySelector('.game-status');
        if (allHidden && searchTerm) {  // 只在有搜索词且没有结果时显示
            gameStatus.style.display = 'block';
        } else {
            gameStatus.style.display = 'none';
        }

        // 显示/隐藏需求发送区域
        this.handleNoResults(hasResults);
    }

    showPinyinHint(card, title, pinyin) {
        let hint = card.querySelector('.pinyin-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'pinyin-hint';
            card.querySelector('.game-info').appendChild(hint);
        }
        hint.textContent = pinyin;
    }

    removePinyinHint(card) {
        const hint = card.querySelector('.pinyin-hint');
        if (hint) {
            hint.remove();
        }
    }

    toggleClearButton(searchTerm) {
        this.clearButton.style.display = searchTerm ? 'block' : 'none';
    }

    handleNoResults(hasResults) {
        const noResultsContainer = document.querySelector('.no-results-container');
        
        if (!hasResults) {
            noResultsContainer.style.display = 'block';
        } else {
            noResultsContainer.style.display = 'none';
        }
    }
}

// 添加消息发送类
class MessageSender {
    constructor() {
        this.appToken = 'AT_G8A6eR9kg7Q3MNBgZPMmChqlaK9KkODc';
        this.uid = 'UID_gzWrDnIKwoScDurnBzcipV99l2rJ';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const textarea = document.getElementById('gameRequest');
        const charCount = document.querySelector('.char-count');
        const sendButton = document.getElementById('sendRequest');
        const requestGame = document.querySelector('.request-game');

        // 字数统计
        textarea.addEventListener('input', (e) => {
            const count = e.target.value.length;
            charCount.textContent = `${count}/200`;
        });

        // 发送请求
        sendButton.addEventListener('click', async () => {
            const content = textarea.value.trim();
            if (!content) {
                // 在输入框下方显示提示
                this.showMessage(requestGame, '请输入游戏需求', 'error');
                return;
            }

            sendButton.classList.add('sending');
            sendButton.innerHTML = `
                <svg class="loading" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="white" fill="none" stroke-width="2"/>
                </svg>
                发送中...
            `;

            try {
                const response = await this.sendWxMessage(content);
                if (response.success) {
                    this.showMessage(requestGame, '发送成功！知道了老娘。', 'success');
                    textarea.value = '';
                    charCount.textContent = '0/200';
                } else {
                    this.showMessage(requestGame, '发送失败，要不然你直接给我打电话呢？', 'error');
                }
            } catch (error) {
                console.error('发送失败:', error);
                this.showMessage(requestGame, '发送失败，要不然你直接给我打电话呢？', 'error');
            } finally {
                sendButton.classList.remove('sending');
                sendButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M2 10l16-6-16 6zm0 0l7 2m9-8l-9 8-7-2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    发送需求
                `;
            }
        });
    }

    showMessage(container, message, type) {
        let messageEl = container.querySelector('.message-tip');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'message-tip';
            container.appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.className = `message-tip ${type}`;
        
        // 3秒后自动消失
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    async sendWxMessage(content) {
        const message = {
            appToken: this.appToken,
            content: `新游戏需求：${content}`,
            summary: "新游戏需求",
            contentType: 2,
            uids: [this.uid],
            verifyPayType: 0
        };

        try {
            const response = await fetch('https://wxpusher.zjiecode.com/api/send/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            });

            const result = await response.json();
            
            if (!result.success) {
                console.error('发送失败:', result);
                throw new Error(result.msg || '发送失败');
            }

            if (result.data && result.data[0] && result.data[0].code !== 1000) {
                console.error('发送状态异常:', result.data[0]);
                throw new Error(result.data[0].status || '发送状态异常');
            }

            return result;
        } catch (error) {
            console.error('发送请求失败:', error);
            throw error;
        }
    }
}

// 简化初始化代码
document.addEventListener('DOMContentLoaded', () => {
    new GameHistory();
    new GameSearch();
    new MessageSender();
}); 