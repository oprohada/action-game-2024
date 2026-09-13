class PuzzleGame {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreDisplay = document.getElementById('score');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modal = document.getElementById('modal');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        this.modalCloseBtn = document.getElementById('modalCloseBtn');
        
        this.score = 0;
        this.moves = 0;
        this.timerInterval = null;
        this.timeElapsed = 0;
        this.gridSize = 4;
        this.tiles = [];
        this.flipped = [];
        this.matched = [];
        this.isChecking = false;
        this.gameActive = true;
        
        this.emojis = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍋', '🍑', '🍒', '🍈', '🍉', '🍍', '🥝', '🍑', '🥭', '🍐', '🥥'];
        
        this.setupEventListeners();
        this.initGame();
    }
    
    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.initGame());
        this.hintBtn.addEventListener('click', () => this.giveHint());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.nextLevelBtn.addEventListener('click', () => this.initGame());
        this.modalCloseBtn.addEventListener('click', () => this.closeModal());
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const level = e.target.dataset.level;
                if (level === 'easy') this.gridSize = 4;
                else if (level === 'medium') this.gridSize = 6;
                else if (level === 'hard') this.gridSize = 8;
                
                this.initGame();
            });
        });
    }
    
    initGame() {
        this.score = 0;
        this.moves = 0;
        this.timeElapsed = 0;
        this.tiles = [];
        this.flipped = [];
        this.matched = [];
        this.isChecking = false;
        this.gameActive = true;
        this.closeModal();
        this.updateDisplay();
        this.generatePuzzle();
        this.renderBoard();
        this.startTimer();
    }
    
    generatePuzzle() {
        const totalTiles = this.gridSize * this.gridSize;
        const pairsNeeded = totalTiles / 2;
        const selectedEmojis = this.emojis.slice(0, pairsNeeded);
        
        // Create pairs
        const puzzle = [...selectedEmojis, ...selectedEmojis];
        
        // Shuffle
        for (let i = puzzle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
        }
        
        this.tiles = puzzle;
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board`;
        
        if (this.gridSize === 6) this.gameBoard.classList.add('medium');
        if (this.gridSize === 8) this.gameBoard.classList.add('hard');
        
        this.tiles.forEach((emoji, index) => {
            const tile = document.createElement('button');
            tile.className = 'tile';
            tile.dataset.index = index;
            
            if (this.matched.includes(index)) {
                tile.classList.add('matched');
                tile.textContent = emoji;
            } else if (this.flipped.includes(index)) {
                tile.classList.add('flipped');
                tile.textContent = emoji;
            } else {
                tile.textContent = '?';
            }
            
            tile.addEventListener('click', () => this.flipTile(index, tile));
            this.gameBoard.appendChild(tile);
        });
    }
    
    flipTile(index, tileElement) {
        if (!this.gameActive || this.isChecking) return;
        if (this.flipped.includes(index) || this.matched.includes(index)) return;
        
        this.flipped.push(index);
        tileElement.classList.add('flipped');
        tileElement.textContent = this.tiles[index];
        
        if (this.flipped.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.checkMatch();
        }
    }
    
    checkMatch() {
        this.isChecking = true;
        const [index1, index2] = this.flipped;
        const isMatch = this.tiles[index1] === this.tiles[index2];
        
        setTimeout(() => {
            if (isMatch) {
                this.matched.push(index1, index2);
                this.score += 10;
                this.flipped = [];
                this.renderBoard();
                
                if (this.matched.length === this.tiles.length) {
                    this.completeGame();
                }
            } else {
                this.flipped = [];
                this.renderBoard();
            }
            this.isChecking = false;
        }, 1000);
    }
    
    completeGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const message = `
            🎮 Final Score: ${this.score}<br>
            🎯 Moves: ${this.moves}<br>
            ⏱️ Time: ${this.timerDisplay.textContent}
        `;
        
        this.showModal('🎉 Puzzle Completed!', message);
    }
    
    giveHint() {
        if (!this.gameActive || this.flipped.length > 0) return;
        
        const unmatched = this.tiles
            .map((_, i) => i)
            .filter(i => !this.matched.includes(i));
        
        if (unmatched.length === 0) return;
        
        const randomIndex = unmatched[Math.floor(Math.random() * unmatched.length)];
        const tileElement = document.querySelector(`[data-index="${randomIndex}"]`);
        
        tileElement.classList.add('hint');
        tileElement.textContent = this.tiles[randomIndex];
        
        setTimeout(() => {
            tileElement.classList.remove('hint');
            tileElement.textContent = '?';
        }, 1500);
    }
    
    resetGame() {
        this.initGame();
    }
    
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.movesDisplay.textContent = this.moves;
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        this.timerDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    showModal(title, message) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').innerHTML = message;
        this.modal.classList.remove('hidden');
    }
    
    closeModal() {
        this.modal.classList.add('hidden');
    }
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
