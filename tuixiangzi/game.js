class SokobanGame {
    constructor() {
        this.currentLevel = 0;
        this.moves = 0;
        this.gameBoard = document.querySelector('.game-board');
        this.moveHistory = [];
        this.undoButton = document.getElementById('undo');
        this.undoButton.disabled = true;
        
        // 从本地存储加载游戏进度
        this.levelProgress = JSON.parse(localStorage.getItem('sokobanProgress')) || {
            currentLevel: 0,
            completedLevels: [],
            lastPlayedLevel: 0
        };
        
        // 如果有上次玩到的关卡，直接加载该关卡
        if (this.levelProgress.lastPlayedLevel > 0) {
            this.currentLevel = this.levelProgress.lastPlayedLevel;
        }
        
        this.targetPositions = [];
        this.bindControls();
        this.initializeLevelSelect();
        
        // 如果有上次玩到的关卡，自动开始该关卡
        if (this.levelProgress.lastPlayedLevel > 0) {
            setTimeout(() => {
                this.startLevel(this.levelProgress.lastPlayedLevel);
            }, 100);
        }
        
        // 添加提示按钮事件监听
        const hintButton = document.getElementById('hint');
        if (hintButton) {
            hintButton.addEventListener('click', () => this.executeNextStep());
        }
        
        // 添加关卡提示信息
        this.hints = {
            0: "把箱子推到绿色目标点上就算过关啦！",
            1: "先向下走，绕到箱子后面，再把箱子推到目标点。",
            2: "先推一个箱子到目标点，再处理另一个。注意不要堵住去路！",
            3: "需要绕一个弯才能把箱子推到位置，想想应该从哪个方向推比较好。",
            4: "利用墙壁的空隙，把箱子推到目标点。",
            5: "两个箱子要配合着推，注意不要让箱子卡在角落。",
            6: "从中间开始，先把中间的箱子推到位，再处理两边的。",
            7: "利用墙壁的缺口，小心地把箱子推过去。",
            8: "两个箱子要交替推动，注意保持通道的畅通。",
            9: "十字路口给了你更多选择，但也要注意箱子的位置。"
            // 可以继续添加更多关卡的提示
        };
        
        // 添加每关的解法步骤
        this.solutions = {
            0: [ // 新手教程
                {dx: 0, dy: -1},  // 向上移动一步
                {dx: 0, dy: -1},  // 再向上移动一步
                {dx: 1, dy: 0},   // 向右移动到箱子左边
                {dx: 0, dy: 1}    // 向下推箱子到目标点
            ],
            1: [ // 直线推进
                {dx: 0, dy: -1},  // 向上移动到箱子后面
                {dx: 1, dy: 0},   // 向右推箱子一步
                {dx: 1, dy: 0}    // 继续向右推到目标点
            ],
            2: [ // 双箱入门
                {dx: 0, dy: -1},  // 向上移动一步
                {dx: 1, dy: 0},   // 向右移动一步
                {dx: 1, dy: 0},   // 继续向右移动到第二个箱子后面
                {dx: 0, dy: -1},  // 向上推第二个箱子
                {dx: -1, dy: 0},  // 向左移动到第一个箱子后面
                {dx: 0, dy: -1}   // 向上推第一个箱子到目标点
            ],
            3: [ // 转角思考
                {dx: 0, dy: -1},  // 向上移动
                {dx: 0, dy: -1},  // 继续向上移动到箱子下方
                {dx: 1, dy: 0},   // 向右移动到箱子左边
                {dx: 0, dy: -1}   // 向上推箱子到目标点
            ],
            4: [ // 回字路线
                {dx: 0, dy: -1},  // 向上移动
                {dx: -1, dy: 0},  // 向左移动
                {dx: 0, dy: -1},  // 向上移动到箱子下方
                {dx: 1, dy: 0},   // 向右移动到���子左边
                {dx: 0, dy: -1}   // 向上推箱子到目标点
            ],
            5: [ // 双箱协作
                {dx: 0, dy: -1},  // 向上移动
                {dx: 1, dy: 0},   // 向右移动
                {dx: 0, dy: -1},  // 向上移动到第一个箱子下方
                {dx: -1, dy: 0},  // 向左推第一个箱子
                {dx: 1, dy: 0},   // 向右移动
                {dx: 0, dy: -1},  // 向上移动到第二个箱子下方
                {dx: -1, dy: 0},  // 向左推第二个箱子到目标点
            ],
            6: [ // 三箱排列
                {dx: 0, dy: -1},  // 向上移动
                {dx: -1, dy: 0},  // 向左移动到第一个箱子右边
                {dx: 0, dy: -1},  // 向上移动到第一个箱子后面
                {dx: -1, dy: 0},  // 向左推第一个箱子
                {dx: 1, dy: 0},   // 向右移动
                {dx: 0, dy: -1},  // 向上移动到第二个箱子后面
                {dx: -1, dy: 0},  // 向左推第二个箱子
                {dx: 1, dy: 0},   // 向右移动
                {dx: 0, dy: -1},  // 向上移动到第三个箱子后面
                {dx: -1, dy: 0}   // 向左推第三个箱子到目标点
            ],
            7: [ // 迷宫探索
                {dx: 1, dy: 0},   // 向右移动
                {dx: 0, dy: -1},  // 向上移动到箱子下方
                {dx: -1, dy: 0},  // 向左移动到箱子右边
                {dx: 0, dy: -1},  // 向上推箱子
                {dx: 0, dy: -1},  // 继续向上推箱子
                {dx: 1, dy: 0},   // 向右推箱子到目标点
            ],
            8: [ // 双向通道
                {dx: 0, dy: -1},  // 向上移动
                {dx: 1, dy: 0},   // 向右移动到第一个箱子左边
                {dx: 0, dy: -1},  // 向上推第一个箱子
                {dx: -1, dy: 0},  // 向左移动
                {dx: 0, dy: 1},   // 向下移动
                {dx: 1, dy: 0},   // 向右移动到第二个箱子左边
                {dx: 0, dy: -1},  // 向上推第二个箱子到目标点
            ],
            9: [ // 十字路口
                {dx: 0, dy: -1},  // 向上移动
                {dx: -1, dy: 0},  // 向左移动到第一个箱子右边
                {dx: 0, dy: -1},  // 向上推第一个箱子
                {dx: 1, dy: 0},   // 向右移动
                {dx: 0, dy: 1},   // 向下移动到第二个箱子上方
                {dx: -1, dy: 0},  // 向左推第二个箱子
                {dx: 1, dy: 0},   // 向右移动到第三个箱子左边
                {dx: 0, dy: -1},  // 向上推第三个箱子到目标点
            ],
            10: [ // 环形通道
                {dx: 0, dy: -1},  // 向上移动
                {dx: 1, dy: 0},   // 向右移动到第一个箱子左边
                {dx: 0, dy: -1},  // 向上推第一个箱子
                {dx: -1, dy: 0},  // 向左移动
                {dx: 0, dy: 1},   // 向下移动到第二个箱子上方
                {dx: 1, dy: 0},   // 向右推第二个箱子
                {dx: -1, dy: 0},  // 向左移动到第三个箱子右边
                {dx: 0, dy: -1},  // 向上推第三个箱子到目标点
            ]
        };
        
        // 记录当前辅助步骤的索引
        this.currentHintStep = 0;
    }

    initializeLevelSelect() {
        const levelGrid = document.querySelector('.level-grid');
        levelGrid.innerHTML = '';
        
        LEVELS.forEach((level, index) => {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.textContent = `第 ${index + 1} 关\n${level.name}`;
            
            if (this.levelProgress.completedLevels.includes(index)) {
                button.classList.add('completed');
            }
            if (index === this.levelProgress.currentLevel) {
                button.classList.add('current');
            }
            
            button.addEventListener('click', () => {
                document.querySelector('.game-container').classList.add('game-active');
                this.startLevel(index);
            });
            levelGrid.appendChild(button);
        });
    }

    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.moves = 0;
        this.level = JSON.parse(JSON.stringify(LEVELS[levelIndex].layout));
        this.moveHistory = [];
        this.targetPositions = [];
        
        // 保存最后玩的关卡
        this.levelProgress.lastPlayedLevel = levelIndex;
        this.saveProgress();
        
        // 记录所有目标点位置
        for (let y = 0; y < this.level.length; y++) {
            for (let x = 0; x < this.level[y].length; x++) {
                if (this.level[y][x] === 3) {
                    this.targetPositions.push({x, y});
                }
                if (this.level[y][x] === 4) {
                    this.playerPos = {x, y};
                }
            }
        }
        
        document.querySelector('.game-container').classList.add('game-active');
        document.querySelector('.current-level').textContent = `当前关卡: ${levelIndex + 1}`;
        document.querySelector('.moves').textContent = `步数: ${this.moves}`;
        this.render();
        
        // 重置提示步骤索引
        this.currentHintStep = 0;
    }

    bindControls() {
        // 按钮控制
        document.getElementById('up')?.addEventListener('click', () => this.move(0, -1));
        document.getElementById('down')?.addEventListener('click', () => this.move(0, 1));
        document.getElementById('left')?.addEventListener('click', () => this.move(-1, 0));
        document.getElementById('right')?.addEventListener('click', () => this.move(1, 0));

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.move(0, -1); break;
                case 'ArrowDown': this.move(0, 1); break;
                case 'ArrowLeft': this.move(-1, 0); break;
                case 'ArrowRight': this.move(1, 0); break;
            }
        });

        // 撤销按钮
        const undoButton = document.getElementById('undo');
        if (undoButton) {
            undoButton.addEventListener('click', () => {
                this.undo();
            });
        }

        // 选择关卡按钮
        const selectLevelButton = document.getElementById('select-level');
        if (selectLevelButton) {
            selectLevelButton.addEventListener('click', () => {
                document.querySelector('.game-container').classList.remove('game-active');
                this.initializeLevelSelect();
            });
        }
    }

    move(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        if (this.level[newY][newX] === 1) return; // 撞墙
        
        const moveData = {
            playerPos: {...this.playerPos},
            boxMove: null
        };
        
        if (this.level[newY][newX] === 2) { // 推箱子
            const boxNewX = newX + dx;
            const boxNewY = newY + dy;
            
            // 检查箱子是否可以被推动
            if (this.level[boxNewY][boxNewX] === 1 || this.level[boxNewY][boxNewX] === 2) {
                return; // 箱子被墙或其他箱子挡住
            }
            
            // 记录箱子移动
            moveData.boxMove = {
                from: {x: newX, y: newY},
                to: {x: boxNewX, y: boxNewY}
            };
            
            // 移动箱子，如果目标位置是目标点，设置为2（而不是改变它）
            this.level[boxNewY][boxNewX] = 2;
            // 移动后的位置处理
            this.level[newY][newX] = this.isTarget(newX, newY) ? 3 : 0;
            // 玩家原位置处理
            this.level[this.playerPos.y][this.playerPos.x] = this.isTarget(this.playerPos.x, this.playerPos.y) ? 3 : 0;
            this.playerPos = {x: newX, y: newY};
            
            this.moves++;
            this.recordMove(moveData);
            this.render();
            this.checkWin();
        } else {
            // 移动玩家
            this.level[this.playerPos.y][this.playerPos.x] = this.isTarget(this.playerPos.x, this.playerPos.y) ? 3 : 0;
            this.playerPos = {x: newX, y: newY};
            
            this.moves++;
            this.recordMove(moveData);
            this.render();
        }
        
        document.querySelector('.moves').textContent = `步数: ${this.moves}`;
    }

    isTarget(x, y) {
        return this.targetPositions.some(pos => pos.x === x && pos.y === y);
    }

    checkWin() {
        // 检查所有目标点是否都有箱子
        return this.targetPositions.every(target => {
            return this.level[target.y][target.x] === 2;
        }) && (() => {
            // 如果胜利，执行胜利后的操作
            if (!this.levelProgress.completedLevels.includes(this.currentLevel)) {
                this.levelProgress.completedLevels.push(this.currentLevel);
                this.saveProgress();
            }

            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = '过关！';
            document.querySelector('.game-container').appendChild(successMessage);

            setTimeout(() => {
                successMessage.remove();
                if (this.currentLevel < LEVELS.length - 1) {
                    this.startLevel(this.currentLevel + 1);
                } else {
                    const finalMessage = document.createElement('div');
                    finalMessage.className = 'success-message';
                    finalMessage.textContent = '恭喜通关！';
                    document.querySelector('.game-container').appendChild(finalMessage);
                    setTimeout(() => finalMessage.remove(), 2000);
                }
            }, 1500);

            return true;
        })();
    }

    render() {
        this.gameBoard.innerHTML = '';
        const size = Math.min(320 / this.level[0].length, 320 / this.level.length);
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.level[0].length}, ${size}px)`;
        
        for (let y = 0; y < this.level.length; y++) {
            for (let x = 0; x < this.level[y].length; x++) {
                const cell = document.createElement('div');
                cell.style.width = `${size}px`;
                cell.style.height = `${size}px`;
                
                // 渲染目标点
                if (this.isTarget(x, y)) {
                    cell.innerHTML = SPRITES.TARGET;
                }
                
                // 渲染其他元素
                switch(this.level[y][x]) {
                    case 1: 
                        cell.innerHTML = SPRITES.WALL;
                        break;
                    case 2:
                        cell.innerHTML = this.isTarget(x, y) ? SPRITES.BOX_ON_TARGET : SPRITES.BOX;
                        break;
                }
                
                if (x === this.playerPos.x && y === this.playerPos.y) {
                    cell.innerHTML = SPRITES.PLAYER;
                }
                
                this.gameBoard.appendChild(cell);
            }
        }
    }

    // 添加记录移动历史的方法
    recordMove(moveData) {
        this.moveHistory.push(moveData);
        this.undoButton.disabled = false;
    }

    // 添加撤销方法
    undo() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // 恢复玩家位置
        this.level[this.playerPos.y][this.playerPos.x] = this.isTarget(this.playerPos.x, this.playerPos.y) ? 3 : 0;
        this.playerPos = lastMove.playerPos;
        this.level[lastMove.playerPos.y][lastMove.playerPos.x] = 4;
        
        // 如果这一步推了箱子，也要恢复箱子位置
        if (lastMove.boxMove) {
            this.level[lastMove.boxMove.to.y][lastMove.boxMove.to.x] = this.isTarget(lastMove.boxMove.to.x, lastMove.boxMove.to.y) ? 3 : 0;
            this.level[lastMove.boxMove.from.y][lastMove.boxMove.from.x] = 2;
        }
        
        // 恢复步数
        this.moves--;
        document.querySelector('.moves').textContent = `步数: ${this.moves}`;
        
        // 如果没有更多史记录，禁用撤销按钮
        if (this.moveHistory.length === 0) {
            this.undoButton.disabled = true;
        }
        
        this.render();
    }

    // 添加检查箱子是否在目标点上的方法
    isBoxOnTarget(x, y) {
        // 检查原始地图中该位置是否是目标点
        const originalMap = LEVELS[this.currentLevel].layout;
        return originalMap[y][x] === 3;
    }

    // 添加保存进度的方法
    saveProgress() {
        localStorage.setItem('sokobanProgress', JSON.stringify(this.levelProgress));
    }

    // 执行下一步辅助操作
    executeNextStep() {
        const solution = this.solutions[this.currentLevel];
        if (!solution) {
            // 如果当前关卡没有解法，说明是bug，需要添加解法
            console.error(`关卡 ${this.currentLevel} 缺少解法！`);
            return;
        }

        // 检查是否已经完成所有步骤
        if (this.currentHintStep >= solution.length) {
            // 如果执行完所有步骤还没过关，说明解法有问题，需要修正
            console.error(`关卡 ${this.currentLevel} 的解法可能有误！`);
            // 重置步骤索引，从头开始
            this.currentHintStep = 0;
        }

        // 执行下一步移动
        const step = solution[this.currentHintStep];
        this.move(step.dx, step.dy);
        this.currentHintStep++;
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new SokobanGame();
}); 