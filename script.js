const gridSize = 10;
const hiddenWords = ['APPLE', 'BANANA', 'CHERRY', 'ORANGE', 'LEMON', 'PEAR', 'PEACH', 'PLUM', 'KIWI', 'GRAPE'];
let wordGrid = [];
let selectedCells = [];
let foundWords = [];
let timeLeft = 90;
let timerInterval;

// Initialize the game
const initGame = () => {
    wordGrid = createEmptyGrid(gridSize);
    placeWordsInGrid(hiddenWords);
    fillRemainingCells();
    renderGrid();
    populateWordList();
};

// Start the game
const startGame = () => {
    document.getElementById('start-button').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    timeLeft = 90;
    foundWords = [];
    selectedCells = [];
    startTimer();
};

// Create an empty grid
const createEmptyGrid = (size) => Array.from({ length: size }, () => Array(size).fill(''));

// Place words into the grid
const placeWordsInGrid = (words) => {
    words.forEach((word) => {
        let placed = false;
        while (!placed) {
            const direction = getRandomDirection();
            const startRow = Math.floor(Math.random() * gridSize);
            const startCol = Math.floor(Math.random() * gridSize);
            if (canPlaceWord(word, startRow, startCol, direction)) {
                placeWord(word, startRow, startCol, direction);
                placed = true;
            }
        }
    });
};

// Get a random direction
const getRandomDirection = () => {
    const directions = ['HORIZONTAL', 'VERTICAL', 'DIAGONAL'];
    return directions[Math.floor(Math.random() * directions.length)];
};

// Check if a word can be placed in a specific direction
const canPlaceWord = (word, row, col, direction) => {
    if (direction === 'HORIZONTAL' && col + word.length > gridSize) return false;
    if (direction === 'VERTICAL' && row + word.length > gridSize) return false;
    if (direction === 'DIAGONAL' && (col + word.length > gridSize || row + word.length > gridSize)) return false;

    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (direction === 'HORIZONTAL' && wordGrid[row][col + i] && wordGrid[row][col + i] !== char) return false;
        if (direction === 'VERTICAL' && wordGrid[row + i][col] && wordGrid[row + i][col] !== char) return false;
        if (direction === 'DIAGONAL' && wordGrid[row + i][col + i] && wordGrid[row + i][col + i] !== char) return false;
    }
    return true;
};

// Place a word in the grid
const placeWord = (word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
        if (direction === 'HORIZONTAL') wordGrid[row][col + i] = word[i];
        else if (direction === 'VERTICAL') wordGrid[row + i][col] = word[i];
        else if (direction === 'DIAGONAL') wordGrid[row + i][col + i] = word[i];
    }
};

// Fill remaining cells with random letters
const fillRemainingCells = () => {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (!wordGrid[row][col]) wordGrid[row][col] = randomLetter();
        }
    }
};

// Render the grid on the screen
const renderGrid = () => {
    const gridContainer = document.getElementById('word-grid');
    gridContainer.innerHTML = '';
    wordGrid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            cell.addEventListener('click', () => selectCell(cell, rowIndex, colIndex));
            gridContainer.appendChild(cell);
        });
    });
};

// Populate the list of hidden words
const populateWordList = () => {
    const wordList = document.getElementById('hidden-words');
    wordList.innerHTML = '';
    hiddenWords.forEach((word) => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        wordList.appendChild(listItem);
    });
};

// Handle cell selection
const selectCell = (cell, row, col) => {
    if (cell.classList.contains('correct') || selectedCells.some((c) => c.row === row && c.col === col)) return;

    cell.classList.add('selected');
    selectedCells.push({ row, col });

    const selectedWord = getSelectedWord();
    if (hiddenWords.includes(selectedWord)) {
        markCorrect();
        foundWords.push(selectedWord);
        if (foundWords.length === hiddenWords.length) showPopup('Congratulations, You Won!', true);
    } else if (selectedWord.length > 10) {
        resetSelection('Incorrect Word!');
    }
};

// Get the selected word
const getSelectedWord = () => selectedCells.map(({ row, col }) => wordGrid[row][col]).join('');

// Mark selected cells as correct
const markCorrect = () => {
    selectedCells.forEach(({ row, col }) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('selected');
        cell.classList.add('correct');
    });
    selectedCells = [];
};

// Reset selected cells
const resetSelection = (message) => {
    selectedCells.forEach(({ row, col }) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('selected');
    });
    selectedCells = [];
    alert(message);
};

// Start the timer
const startTimer = () => {
    const timerElement = document.getElementById('time-left');
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showPopup('Time is up! Try again.', false);
        }
    }, 1000);
};

// Show popup message
const showPopup = (message, isWin) => {
    const popup = document.getElementById('popup');
    document.getElementById('popup-message').textContent = message;
    popup.classList.remove('hidden');
};

// Generate a random letter
const randomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
};

// Reset the game
document.getElementById('reset-button').addEventListener('click', () => {
    foundWords = [];
    selectedCells = [];
    clearInterval(timerInterval);
    timeLeft = 90;
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('start-button').classList.remove('hidden');
});

// Start the game when the start button is clicked
document.getElementById('start-button').addEventListener('click', () => {
    initGame();
    startGame();
});