const gridSize = 15;
const hiddenWords = ['WELLBEING', 'ENERGY', 'FOR', 'MENTAL', 'SOCIAL', 'PHYSICAL', 'ENVIRONMENTAL', 'SUSTAINABILITY']
const hiddenWordsSorted = ['BEEGILLNW', 'EEGNRY', 'FOR', 'AELMNT', 'ACILOS', 'ACHILPSY', 'AEEILMNNNORTV', 'AABIIILNSSTTUY']
let wordGrid = [];
let selectedCells = [];
let foundWords = [];
let timeLeft = 30;
let timerInterval;
let playerName = '';

// Create onscreen keyboard
const createKeyboard = () => {
    const keyboardContainer = document.getElementById('onscreen-keyboard');
    if (keyboardContainer.children.length > 0) return;

    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ,'.split('');
    keys.forEach((key) => {
        const button = document.createElement('button');
        button.textContent = key;
        button.classList.add('key');
        button.addEventListener('click', () => {
            const input = document.getElementById('player-name');
            input.value += key;
            playerName = input.value.trim();
            document.getElementById('start-game-btn').classList.remove('hidden');
        });
        keyboardContainer.appendChild(button);
    });
    
    const backspaceButton = document.createElement('button');
    backspaceButton.textContent = '⌫';
    backspaceButton.classList.add('key');
    // backspaceButton.style.width = '0px'; 
    backspaceButton.addEventListener('click', () => {
        const input = document.getElementById('player-name');
        input.value = input.value.slice(0, -1);
        playerName = input.value.trim();
        if (!playerName) document.getElementById('start-game-btn').classList.add('hidden');
    });
    keyboardContainer.appendChild(backspaceButton);

    const spaceButton = document.createElement('button');
    spaceButton.textContent = ''; // Space symbol
    spaceButton.classList.add('key');
    spaceButton.style.width = '155px'; 
    spaceButton.addEventListener('click', () => {
        const input = document.getElementById('player-name');
        input.value += ' '; // Add a space to the input value
        playerName = input.value.trim();
        if (playerName) document.getElementById('start-game-btn').classList.remove('hidden');
    });
    keyboardContainer.appendChild(spaceButton);
    };

// Initialize the game
const initGame = () => {
    wordGrid = createEmptyGrid(gridSize);
    placeWordsInGrid(hiddenWords);
    fillRemainingCells();
    renderGrid();
    resetTimer();
};

// Start the game
const startGame = () => {
    if (!playerName.trim()) {
        alert('Please enter your name!');
        return;
    }
    document.getElementById('start-page').classList.add('hidden');
    document.getElementById('game-page').classList.remove('hidden');
    initGame();
    startTimer();
};

// Reset the game and return to Start
const resetGame = () => {
    resetTimer();
    clearInterval(timerInterval);
    foundWords = [];
    selectedCells = [];
    timeLeft = 30;
    document.getElementById('word-grid').innerHTML = '';
    document.getElementById('popup').classList.add('hidden');
    document.getElementById('game-page').classList.add('hidden');
    document.getElementById('start-page').classList.remove('hidden');
    document.getElementById('player-name').value = '';
    playerName = '';
    document.getElementById('start-game-btn').classList.add('hidden');
};

// End the game and display a message
const endGame = (message) => {
    clearInterval(timerInterval);
    const score = foundWords.length;
    saveToServer(playerName, score); // Save to server
    showPopup(message, score); // Pass the score to the popup
};

// Show popup message with score
const showPopup = (message, score) => {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');

    // Display message and score
    popupMessage.textContent = `${message} Your score: ${score}`;
    popup.classList.remove('hidden');
};
// Timer logic
const startTimer = () => {
    const timerElement = document.getElementById('time-left');
    clearInterval(timerInterval); // Ensure no duplicate intervals
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame('Time is up!');
        } else {
            timeLeft--;
            timerElement.textContent = timeLeft; // Update the timer display
        }
    }, 1000);
};

// Reset the timer
const resetTimer = () => {
    clearInterval(timerInterval);
    timeLeft = 30;
    document.getElementById('time-left').textContent = timeLeft; // Reset timer display
};

// Grid and Word Functions
const createEmptyGrid = (size) => Array.from({ length: size }, () => Array(size).fill(''));

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

const getRandomDirection = () => {
    const directions = ['HORIZONTAL', 'VERTICAL', 'DIAGONAL'];
    return directions[Math.floor(Math.random() * directions.length)];
};

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

const placeWord = (word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
        if (direction === 'HORIZONTAL') wordGrid[row][col + i] = word[i];
        else if (direction === 'VERTICAL') wordGrid[row + i][col] = word[i];
        else if (direction === 'DIAGONAL') wordGrid[row + i][col + i] = word[i];
    }
};

const fillRemainingCells = () => {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (!wordGrid[row][col]) wordGrid[row][col] = randomLetter();
        }
    }
};

const randomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
};

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

// Handle cell selection
const selectCell = (cell, row, col) => {
    if (cell.classList.contains('correct')) return;

    cell.classList.toggle('selected');
    const cellData = { row, col };
    const index = selectedCells.findIndex((c) => c.row === row && c.col === col);

    if (index > -1) {
        selectedCells.splice(index, 1);
    } else {
        selectedCells.push(cellData);
    }

    const selectedWord = getSelectedWord();
    let sortedSelectedWord = selectedWord.split('').sort().join('');
    if (hiddenWordsSorted.includes(sortedSelectedWord)) {
        markCorrect();
        foundWords.push(selectedWord);
        if (foundWords.length === hiddenWords.length) endGame('Congratulations! You Won!');
    } else if (selectedWord.length > gridSize) {
        resetSelection('Incorrect Word!');
    }
};

const getSelectedWord = () => selectedCells.map(({ row, col }) => wordGrid[row][col]).join('');

const markCorrect = () => {
    selectedCells.forEach(({ row, col }) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('correct');
        cell.classList.remove('selected');
    });
    selectedCells = [];
};

const resetSelection = (message) => {
    selectedCells.forEach(({ row, col }) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('selected');
    });
    selectedCells = [];
    alert(message);
};
const saveToServer = (name, score) => {
    fetch('/save-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score }),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Score saved successfully!');
            } else {
                console.error('Failed to save score.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
};

// Event listeners
document.getElementById('start-game-btn').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('game-reset-button').addEventListener('click', resetGame);

// Initialize keyboard
createKeyboard();