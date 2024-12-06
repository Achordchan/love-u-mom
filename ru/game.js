class Tetris {
    constructor() {
        this.board = [];
        this.currentPiece = null;
        this.score = 0;
        this.isPlaying = false;
        this.gameBoard = document.querySelector('.game-board');
        this.scoreElement = document.getElementById('score');
        
        // 初始化游戏板
        this.initBoard();
        // 绑定控制按钮
        this.bindControls();
        // 绑定触摸事件
        this.bindTouchEvents();
        
        // 添加方块形状定义
        this.shapes = {
            I: [
                [1, 1, 1, 1]
            ],
            J: [
                [1, 0, 0],
                [1, 1, 1]
            ],
            L: [
                [0, 0, 1],
                [1, 1, 1]
            ],
            O: [
                [1, 1],
                [1, 1]
            ],
            S: [
                [0, 1, 1],
                [1, 1, 0]
            ],
            T: [
                [0, 1, 0],
                [1, 1, 1]
            ],
            Z: [
                [1, 1, 0],
                [0, 1, 1]
            ]
        };
        
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.nextPiece = null;
        this.gameInterval = null;
        
        // 添加时间控制相关属性
        this.lastDropTime = 0;  // 上次下落的时间
        this.speed = 1000;      // 默认速度（简单模式）
        this.bindDifficultyButtons();
        
        // 添加方块颜色定义
        this.colors = {
            I: '#00f0f0',  // 青色
            O: '#f0f000',  // 黄色
            T: '#a000f0',  // 紫色
            S: '#00f000',  // 绿色
            Z: '#f00000',  // 红色
            J: '#0000f0',  // 蓝色
            L: '#f0a000'   // 橙色
        };

        // 添加隐藏地址栏的代码
        window.addEventListener("load", () => {
            // 设置延时
            setTimeout(() => {
                // 隐藏地址栏
                window.scrollTo(0, 1);
            }, 0);
        });

        // 处理方向改变时重新隐藏地址栏
        window.addEventListener("orientationchange", () => {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 0);
        });

        // 添加字体缩放适配
        this.handleFontZoom();
        
        // 添加屏幕旋转处理
        this.handleOrientation();
    }

    initBoard() {
        // 创建20行10列的游戏板
        for (let i = 0; i < 20; i++) {
            this.board[i] = new Array(10).fill(0);
        }
        this.renderBoard();
    }

    bindControls() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }

    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let isTap = false;
        let touchStartTime = 0;
        const TAP_THRESHOLD = 200; // 轻触判定时间阈值（毫秒）
        const MOVE_THRESHOLD = 10; // 移动判定距离阈值（像素）

        // 触摸开始
        this.gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isTap = true;
            touchStartTime = Date.now();
        }, { passive: false });

        // 触摸移动
        this.gameBoard.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isPlaying) return;
            
            const moveX = e.touches[0].clientX - startX;
            const moveY = e.touches[0].clientY - startY;

            // 如果移动距离超过阈值，则不是轻触
            if (Math.abs(moveX) > MOVE_THRESHOLD || Math.abs(moveY) > MOVE_THRESHOLD) {
                isTap = false;
            }

            // 判断移动方向
            if (Math.abs(moveY) > Math.abs(moveX)) {
                // 垂直移动
                if (moveY > 50) {  // 向下滑动
                    this.dropToBottom();
                    startY = e.touches[0].clientY;
                }
            } else {
                // 水平移动
                if (Math.abs(moveX) > 50) {
                    if (moveX > 0) {
                        this.movePieceRight();
                    } else {
                        this.movePieceLeft();
                    }
                    startX = e.touches[0].clientX;
                }
            }
        }, { passive: false });

        // 触摸结束
        this.gameBoard.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchEndTime = Date.now();
            
            // 判断是否是轻触（触摸时间短且移动距离小）
            if (isTap && (touchEndTime - touchStartTime) < TAP_THRESHOLD) {
                if (this.isPlaying) {
                    this.rotatePiece();
                }
            }
        }, { passive: false });

        // 移除原来的click事件监听器，因为我们现在用touchend来处理轻触
        this.gameBoard.removeEventListener('click', this.rotatePiece);
    }

    // 生成新方块
    generatePiece() {
        const pieces = Object.keys(this.shapes);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            shape: this.shapes[randomPiece],
            type: randomPiece
        };
    }

    // 开始游戏
    start() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.currentPiece = this.generatePiece();
            this.nextPiece = this.generatePiece();
            this.currentX = Math.floor((10 - this.currentPiece.shape[0].length) / 2);
            this.currentY = 0;
            this.lastDropTime = 0;  // 重置时间
            this.gameInterval = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
            this.renderNextPiece();
        }
    }

    // 游戏主循环
    gameLoop(timestamp) {
        if (!this.isPlaying) return;
        
        // 计算时间差
        if (!this.lastDropTime) this.lastDropTime = timestamp;
        const deltaTime = timestamp - this.lastDropTime;
        
        // 根据难度控制下落
        if (deltaTime > this.speed) {
            if (this.canMove(this.currentX, this.currentY + 1)) {
                this.currentY++;
            } else {
                this.freezePiece();
                this.clearLines();
                
                // 生成新方块
                this.currentPiece = this.nextPiece;
                this.nextPiece = this.generatePiece();
                this.currentX = Math.floor((10 - this.currentPiece.shape[0].length) / 2);
                this.currentY = 0;
                
                // 检查游戏是否结束
                if (this.isGameOver()) {
                    this.gameOver();
                    return;
                }
            }
            this.lastDropTime = timestamp;
            this.renderBoard();
        }
        
        this.gameInterval = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    // 碰撞检测
    canMove(newX, newY) {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const nextX = newX + x;
                    const nextY = newY + y;
                    
                    if (nextX < 0 || nextX >= 10 || nextY >= 20) return false;
                    if (nextY >= 0 && this.board[nextY][nextX]) return false;
                }
            }
        }
        return true;
    }

    // 固定方块
    freezePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.board[this.currentY + y][this.currentX + x] = this.currentPiece.type;
                }
            }
        }
    }

    // 移动方块
    movePieceLeft() {
        if (this.canMove(this.currentX - 1, this.currentY)) {
            this.currentX--;
            this.renderBoard();
        }
    }

    movePieceRight() {
        if (this.canMove(this.currentX + 1, this.currentY)) {
            this.currentX++;
            this.renderBoard();
        }
    }

    // 旋转方块
    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (!this.canMove(this.currentX, this.currentY)) {
            this.currentPiece.shape = originalShape;
        } else {
            this.renderBoard();
        }
    }

    // 渲染游戏板
    renderBoard() {
        const displayBoard = this.board.map(row => [...row]);
        
        // 渲染当前方块
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const boardY = this.currentY + y;
                        const boardX = this.currentX + x;
                        if (boardY >= 0) {
                            displayBoard[boardY][boardX] = this.currentPiece.type;
                        }
                    }
                }
            }
        }

        this.gameBoard.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                if (displayBoard[i][j]) {
                    const color = this.colors[displayBoard[i][j]];
                    cell.style.backgroundColor = color;
                    // 添加内部阴影效果
                    cell.style.boxShadow = `inset -3px -3px 2px rgba(0,0,0,0.2), 
                                          inset 3px 3px 2px rgba(255,255,255,0.2)`;
                    cell.style.border = '1px solid rgba(0,0,0,0.1)';
                } else {
                    cell.style.backgroundColor = '#fff';
                    cell.style.border = '1px solid rgba(0,0,0,0.05)';
                }
                
                this.gameBoard.appendChild(cell);
            }
        }

        this.renderNextPiece();
    }

    // 游戏结束检测
    isGameOver() {
        // 检查新方块生成时是否已经与现有方块重叠
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const boardY = this.currentY + y;
                        const boardX = this.currentX + x;
                        // 如果新方块的位置已经有方块，游戏结束
                        if (boardY >= 0 && this.board[boardY][boardX]) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // 游戏结束处理
    gameOver() {
        this.isPlaying = false;
        cancelAnimationFrame(this.gameInterval);
        
        // 创建游戏结束提示
        const gameOverPopup = document.createElement('div');
        gameOverPopup.className = 'score-popup';  // 使用相同的弹出样式
        gameOverPopup.style.backgroundColor = 'rgba(255, 59, 48, 0.9)';  // 使用红色背景
        gameOverPopup.textContent = `游戏结束！得分：${this.score}`;
        
        // 将提示添加到游戏板上方
        this.gameBoard.parentNode.appendChild(gameOverPopup);
        
        // 3秒后移除提示
        setTimeout(() => {
            gameOverPopup.remove();
        }, 3000);
    }

    // 清除完整行
    clearLines() {
        let linesCleared = 0;
        
        for (let y = 19; y >= 0; y--) {
            // 检查是否有任何类型的方块（不是只检查1）
            if (this.board[y].every(cell => cell !== 0)) {
                // 移除这一行
                this.board.splice(y, 1);
                // 在顶部添加新的空行
                this.board.unshift(new Array(10).fill(0));
                linesCleared++;
                // 因为删除了一行，需要重新检查当前行
                y++;
            }
        }
        
        // 根据同时消除的行数计算得分
        if (linesCleared > 0) {
            // 经典俄罗斯方块的计分规则
            const scores = {
                1: 100,    // 消除1行：100分
                2: 300,    // 消除2行：300分
                3: 500,    // 消除3行：500分
                4: 800     // 消除4行：800分
            };
            
            this.score += scores[linesCleared] || scores[1];
            this.scoreElement.textContent = this.score;
            
            // 可以添加消除行的动画效果
            this.showClearAnimation(linesCleared);
        }
    }

    // 添加消除动画效果
    showClearAnimation(lines) {
        // 创建一个临时的分数提示
        const scorePopup = document.createElement('div');
        scorePopup.className = 'score-popup';
        scorePopup.textContent = `+${lines === 4 ? '800 完美!' : lines * 100}`;
        
        // 将提示添加到游戏板上方
        this.gameBoard.parentNode.appendChild(scorePopup);
        
        // 2秒后移除提示
        setTimeout(() => {
            scorePopup.remove();
        }, 2000);
    }

    // 暂停游戏
    pause() {
        this.isPlaying = false;
        cancelAnimationFrame(this.gameInterval);
    }

    // 重新开始
    restart() {
        cancelAnimationFrame(this.gameInterval);
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.isPlaying = false;
        const activeButton = document.querySelector('.difficulty-btn.active');
        if (activeButton) {
            this.speed = parseInt(activeButton.dataset.speed);
        }
        this.renderBoard();
        this.renderNextPiece();
    }

    // 添加难度选择按钮绑定
    bindDifficultyButtons() {
        const buttons = document.querySelectorAll('.difficulty-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.isPlaying) {  // 只有在游戏未开始时才能切换难度
                    // 更新按钮样式
                    buttons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // 设置游戏速度
                    this.speed = parseInt(button.dataset.speed);
                    this.lastDropTime = 0;  // 重置时间
                }
            });
        });
    }

    // 添加快速下落方法
    dropToBottom() {
        if (!this.isPlaying || !this.currentPiece) return;
        
        while (this.canMove(this.currentX, this.currentY + 1)) {
            this.currentY++;
        }
        this.renderBoard();
    }

    // 添加预区域渲染方法
    renderNextPiece() {
        const nextPieceBoard = document.querySelector('.next-piece-board');
        nextPieceBoard.innerHTML = '';
        
        if (!this.nextPiece) return;

        // 创建一个4x4的网格来显示下一个方块
        const previewGrid = document.createElement('div');
        previewGrid.style.display = 'grid';
        previewGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
        previewGrid.style.gap = '2px';  // 添加间隙
        previewGrid.style.width = '100%';
        previewGrid.style.height = '100%';
        previewGrid.style.justifyContent = 'center';
        previewGrid.style.alignContent = 'center';

        // 居中偏移
        const offsetX = Math.floor((4 - this.nextPiece.shape[0].length) / 2);
        const offsetY = Math.floor((4 - this.nextPiece.shape.length) / 2);

        // 创建4x4的预览区域
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'preview-cell';

                // 检查是否应该渲染方块
                const pieceY = i - offsetY;
                const pieceX = j - offsetX;
                if (
                    pieceY >= 0 && 
                    pieceY < this.nextPiece.shape.length && 
                    pieceX >= 0 && 
                    pieceX < this.nextPiece.shape[0].length && 
                    this.nextPiece.shape[pieceY][pieceX]
                ) {
                    cell.style.backgroundColor = this.colors[this.nextPiece.type];
                    cell.style.boxShadow = 'inset -2px -2px 2px rgba(0,0,0,0.2), inset 2px 2px 2px rgba(255,255,255,0.2)';
                    cell.style.border = '1px solid rgba(0,0,0,0.1)';
                }
                previewGrid.appendChild(cell);
            }
        }
        
        nextPieceBoard.appendChild(previewGrid);
    }

    // 添加字体缩放适配方法
    handleFontZoom() {
        // 监听字体大小变化
        window.addEventListener('resize', () => {
            this.adjustLayout();
        });
        
        // 初始调整
        this.adjustLayout();
    }
    
    // 调整布局方法
    adjustLayout() {
        const container = document.querySelector('.game-container');
        const gameBoard = document.querySelector('.game-board');
        const controls = document.querySelector('.controls');
        
        // 计算可用空间
        const availableHeight = window.innerHeight;
        const controlsHeight = controls.offsetHeight;
        const headerHeight = document.querySelector('.game-header').offsetHeight;
        
        // 调整游戏板大小
        const maxBoardHeight = availableHeight - controlsHeight - headerHeight - 40; // 40px作为边距
        gameBoard.style.maxHeight = `${maxBoardHeight}px`;
        
        // 确保控制按钮可见
        controls.style.bottom = `${Math.max(0, window.innerHeight - container.offsetHeight)}px`;
    }
    
    // 处理屏幕旋转
    handleOrientation() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustLayout();
            }, 100);
        });
    }
}

// 初始化游戏
const game = new Tetris(); 