class CrosswordGame {
    constructor() {
        this.grid = [];
        this.gridSize = 21;
        this.words = [];
        this.currentWord = null;
        this.currentDirection = 'across';
        this.isDarkMode = false;
        this.showClues = true;
        
        this.initializeWordLists();
        this.initializeEventListeners();
    }

    initializeWordLists() {
        this.wordLists = {
            animals: [
                { word: "ELEPHANT", clue: "Largest land animal" },
                { word: "TIGER", clue: "Striped big cat" },
                { word: "DOLPHIN", clue: "Intelligent marine mammal" },
                { word: "EAGLE", clue: "National bird of America" },
                { word: "BEAR", clue: "Large forest mammal" },
                { word: "WOLF", clue: "Pack hunting canine" },
                { word: "ZEBRA", clue: "Striped African horse" },
                { word: "GIRAFFE", clue: "Tallest animal in the world" },
                { word: "PENGUIN", clue: "Flightless Antarctic bird" },
                { word: "KANGAROO", clue: "Hopping Australian marsupial" }
            ],
            plants: [
                { word: "ROSE", clue: "Thorny romantic flower" },
                { word: "TULIP", clue: "Dutch spring bulb flower" },
                { word: "CACTUS", clue: "Desert plant with spines" },
                { word: "BAMBOO", clue: "Fast-growing Asian grass" },
                { word: "ORCHID", clue: "Exotic tropical flower" },
                { word: "FERN", clue: "Ancient spore-bearing plant" },
                { word: "MAPLE", clue: "Tree known for syrup" },
                { word: "LAVENDER", clue: "Purple fragrant herb" },
                { word: "SUNFLOWER", clue: "Tall yellow flower that tracks the sun" },
                { word: "DAISY", clue: "White petaled common flower" }
            ],
            computers: [
                { word: "KEYBOARD", clue: "Input device with keys" },
                { word: "MONITOR", clue: "Computer display screen" },
                { word: "MOUSE", clue: "Pointing device for computers" },
                { word: "PIXEL", clue: "Smallest unit of a digital image" },
                { word: "BROWSER", clue: "Software for viewing websites" },
                { word: "SERVER", clue: "Computer that provides services" },
                { word: "CODING", clue: "Writing computer programs" },
                { word: "VIRUS", clue: "Malicious computer program" },
                { word: "BACKUP", clue: "Copy of data for safety" },
                { word: "WEBSITE", clue: "Collection of web pages" }
            ],
            bugs: [
                { word: "BUTTERFLY", clue: "Colorful winged insect" },
                { word: "SPIDER", clue: "Eight-legged web spinner" },
                { word: "BEETLE", clue: "Hard-shelled insect" },
                { word: "CRICKET", clue: "Chirping jumping insect" },
                { word: "DRAGONFLY", clue: "Fast-flying pond insect" },
                { word: "LADYBUG", clue: "Red spotted beneficial beetle" },
                { word: "MOSQUITO", clue: "Blood-sucking flying pest" },
                { word: "FIREFLY", clue: "Bioluminescent evening insect" },
                { word: "CATERPILLAR", clue: "Butterfly larva stage" },
                { word: "GRASSHOPPER", clue: "Green jumping field insect" }
            ],
            fish: [
                { word: "SALMON", clue: "Pink fish that swims upstream" },
                { word: "SHARK", clue: "Predatory ocean fish" },
                { word: "TUNA", clue: "Large commercial fish" },
                { word: "GOLDFISH", clue: "Popular orange pet fish" },
                { word: "TROUT", clue: "Freshwater sport fish" },
                { word: "BASS", clue: "Popular game fish" },
                { word: "SWORDFISH", clue: "Fish with a long pointed bill" },
                { word: "ANGELFISH", clue: "Tropical aquarium fish" },
                { word: "CATFISH", clue: "Bottom-dwelling whiskered fish" },
                { word: "SEAHORSE", clue: "Horse-shaped marine fish" }
            ],
            wordList4: [
                { word: "CO-OP", clue: "Type of housing" },
                { word: "DON'T", clue: "Contraction of do not" },
                { word: "12MONKEYS", clue: "Sci-fi movie" },
                { word: "SPACESHIP", clue: "Travels in space" },
                { word: "ALIEN", clue: "Extraterrestrial being" }
            ],
            wordList5: [
                { word: "MOON", clue: "Earth's natural satellite" },
                { word: "MOON", clue: "Earth's only moon" },
                { word: "SUN", clue: "Center of our solar system" },
                { word: "EARTH", clue: "Our planet" },
                { word: "MARS", clue: "Red planet" }
            ]
        };
    }

    validateWordList(list) {
        const errors = [];
        const words = new Set();
        const clues = new Set();

        list.forEach(({ word, clue }, idx) => {
            if (!/^[A-Z]+$/.test(word)) {
                errors.push(`Invalid characters in word "${word}"`);
            }
            if (words.has(word)) {
                errors.push(`Duplicate word: "${word}"`);
            }
            if (clues.has(clue)) {
                errors.push(`Duplicate clue: "${clue}"`);
            }
            words.add(word);
            clues.add(clue);
        });

        return errors.length ? errors : ["Word list is valid"];
    }

    initializeGrid() {
        this.grid = Array(this.gridSize).fill().map(() => 
            Array(this.gridSize).fill().map(() => ({
                letter: '',
                isBlack: true,
                numbers: [],
                acrossWord: null,
                downWord: null,
                userInput: ''
            }))
        );
    }

    findIntersections(word1, word2) {
        const intersections = [];
        for (let i = 0; i < word1.length; i++) {
            for (let j = 0; j < word2.length; j++) {
                if (word1[i] === word2[j]) {
                    intersections.push({ word1Index: i, word2Index: j });
                }
            }
        }
        return intersections;
    }

    canPlaceWordProperly(word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'across') {
            if (col + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentRow = row;
                const currentCol = col + i;
                const cell = this.grid[currentRow][currentCol];
                
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
                
                if (cell.letter === '') {
                    let needsDownWord = false;
                    
                    if (currentRow > 0 && !this.grid[currentRow - 1][currentCol].isBlack) {
                        needsDownWord = true;
                    }
                    if (currentRow < this.gridSize - 1 && !this.grid[currentRow + 1][currentCol].isBlack) {
                        needsDownWord = true;
                    }
                    
                    if (needsDownWord) {
                        let hasValidDownWord = false;
                        for (const placedWord of this.words) {
                            if (placedWord.direction === 'down') {
                                const wordStartRow = placedWord.row;
                                const wordEndRow = placedWord.row + placedWord.word.length - 1;
                                if (placedWord.col === currentCol && 
                                    currentRow >= wordStartRow && 
                                    currentRow <= wordEndRow) {
                                    hasValidDownWord = true;
                                    break;
                                }
                            }
                        }
                        if (!hasValidDownWord) return false;
                    }
                }
            }
            
            if (col > 0 && !this.grid[row][col - 1].isBlack) return false;
            if (col + wordLength < this.gridSize && !this.grid[row][col + wordLength].isBlack) return false;
        } else {
            if (row + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentRow = row + i;
                const currentCol = col;
                const cell = this.grid[currentRow][currentCol];
                
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
                
                if (cell.letter === '') {
                    let needsAcrossWord = false;
                    
                    if (currentCol > 0 && !this.grid[currentRow][currentCol - 1].isBlack) {
                        needsAcrossWord = true;
                    }
                    if (currentCol < this.gridSize - 1 && !this.grid[currentRow][currentCol + 1].isBlack) {
                        needsAcrossWord = true;
                    }
                    
                    if (needsAcrossWord) {
                        let hasValidAcrossWord = false;
                        for (const placedWord of this.words) {
                            if (placedWord.direction === 'across') {
                                const wordStartCol = placedWord.col;
                                const wordEndCol = placedWord.col + placedWord.word.length - 1;
                                if (placedWord.row === currentRow && 
                                    currentCol >= wordStartCol && 
                                    currentCol <= wordEndCol) {
                                    hasValidAcrossWord = true;
                                    break;
                                }
                            }
                        }
                        if (!hasValidAcrossWord) return false;
                    }
                }
            }
            
            if (row > 0 && !this.grid[row - 1][col].isBlack) return false;
            if (row + wordLength < this.gridSize && !this.grid[row + wordLength][col].isBlack) return false;
        }
        
        return true;
    }

    canPlaceWordBasic(word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'across') {
            if (col + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row][col + i];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (col > 0 && !this.grid[row][col - 1].isBlack) return false;
            if (col + wordLength < this.gridSize && !this.grid[row][col + wordLength].isBlack) return false;
        } else {
            if (row + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row + i][col];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (row > 0 && !this.grid[row - 1][col].isBlack) return false;
            if (row + wordLength < this.gridSize && !this.grid[row + wordLength][col].isBlack) return false;
        }
        
        return true;
    }

    canPlaceWord(word, row, col, direction) {
        const wordLength = word.length;
        
        if (direction === 'across') {
            if (col + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row][col + i];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (col > 0 && !this.grid[row][col - 1].isBlack) return false;
            if (col + wordLength < this.gridSize && !this.grid[row][col + wordLength].isBlack) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentCol = col + i;
                const cell = this.grid[row][currentCol];
                
                if (cell.letter === '') {
                    if (row > 0 && !this.grid[row - 1][currentCol].isBlack) {
                        let hasDownWord = false;
                        for (let checkRow = row - 1; checkRow >= 0 && !this.grid[checkRow][currentCol].isBlack; checkRow--) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        for (let checkRow = row + 1; checkRow < this.gridSize && !this.grid[checkRow][currentCol].isBlack; checkRow++) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        if (!hasDownWord) return false;
                    }
                    
                    if (row < this.gridSize - 1 && !this.grid[row + 1][currentCol].isBlack) {
                        let hasDownWord = false;
                        for (let checkRow = row - 1; checkRow >= 0 && !this.grid[checkRow][currentCol].isBlack; checkRow--) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        for (let checkRow = row + 1; checkRow < this.gridSize && !this.grid[checkRow][currentCol].isBlack; checkRow++) {
                            if (this.grid[checkRow][currentCol].downWord) {
                                hasDownWord = true;
                                break;
                            }
                        }
                        if (!hasDownWord) return false;
                    }
                }
            }
        } else {
            if (row + wordLength > this.gridSize) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const cell = this.grid[row + i][col];
                if (cell.letter !== '' && cell.letter !== word[i]) {
                    return false;
                }
            }
            
            if (row > 0 && !this.grid[row - 1][col].isBlack) return false;
            if (row + wordLength < this.gridSize && !this.grid[row + wordLength][col].isBlack) return false;
            
            for (let i = 0; i < wordLength; i++) {
                const currentRow = row + i;
                const cell = this.grid[currentRow][col];
                
                if (cell.letter === '') {
                    if (col > 0 && !this.grid[currentRow][col - 1].isBlack) {
                        let hasAcrossWord = false;
                        for (let checkCol = col - 1; checkCol >= 0 && !this.grid[currentRow][checkCol].isBlack; checkCol--) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        for (let checkCol = col + 1; checkCol < this.gridSize && !this.grid[currentRow][checkCol].isBlack; checkCol++) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        if (!hasAcrossWord) return false;
                    }
                    
                    if (col < this.gridSize - 1 && !this.grid[currentRow][col + 1].isBlack) {
                        let hasAcrossWord = false;
                        for (let checkCol = col - 1; checkCol >= 0 && !this.grid[currentRow][checkCol].isBlack; checkCol--) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        for (let checkCol = col + 1; checkCol < this.gridSize && !this.grid[currentRow][checkCol].isBlack; checkCol++) {
                            if (this.grid[currentRow][checkCol].acrossWord) {
                                hasAcrossWord = true;
                                break;
                            }
                        }
                        if (!hasAcrossWord) return false;
                    }
                }
            }
        }
        
        return true;
    }

    placeWord(wordObj, row, col, direction, number) {
        const word = wordObj.word;
        const wordData = {
            word: wordObj.word,
            clue: wordObj.clue,
            number: number,
            row: row,
            col: col,
            direction: direction
        };

        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            this.grid[currentRow][currentCol].letter = word[i];
            this.grid[currentRow][currentCol].isBlack = false;
            
            if (direction === 'across') {
                this.grid[currentRow][currentCol].acrossWord = wordData;
            } else {
                this.grid[currentRow][currentCol].downWord = wordData;
            }
            
            if (i === 0) {
                if (!this.grid[currentRow][currentCol].numbers.includes(number)) {
                    this.grid[currentRow][currentCol].numbers.push(number);
                }
            }
        }
        
        this.words.push(wordData);
    }

    async generatePuzzle() {
        const selectedWordList = document.getElementById('wordListSelector').value;
        const wordList = this.wordLists[selectedWordList];
        
        const validationResults = this.validateWordList(wordList);
        this.displayValidationResults(validationResults);
        
        if (validationResults[0] !== "Word list is valid") {
            return;
        }

        this.showLoading();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await this.generatePuzzleWithTimeout(wordList);
        
        this.hideLoading();
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
    
    updateLoadingProgress(text) {
        const progress = document.getElementById('loadingProgress');
        if (progress) {
            progress.textContent = text;
        }
    }
    
    async generatePuzzleWithTimeout(wordList) {
        const startTime = Date.now();
        const maxTime = 15000;
        let bestAttempt = { words: [], score: 0 };
        let attemptCount = 0;
        
        while (Date.now() - startTime < maxTime) {
            attemptCount++;
            
            this.initializeGrid();
            this.words = [];
        
            const sortedWords = [...wordList].sort((a, b) => b.word.length - a.word.length);
            let wordNumber = 1;
            
            if (sortedWords.length > 0) {
                const firstWord = sortedWords[0];
                const startRow = Math.floor(this.gridSize / 2);
                const startCol = Math.floor((this.gridSize - firstWord.word.length) / 2);
                this.placeWord(firstWord, startRow, startCol, 'across', wordNumber++);
            }
            
            const timeForThisAttempt = Math.min(2000, maxTime - (Date.now() - startTime));
            await this.placeWordsWithTimeLimit(sortedWords, wordNumber, timeForThisAttempt);
            
            const score = this.words.length;
            if (score > bestAttempt.score) {
                bestAttempt = {
                    words: JSON.parse(JSON.stringify(this.words)),
                    grid: JSON.parse(JSON.stringify(this.grid)),
                    score: score
                };
                
                this.updateLoadingProgress(`Best: ${score}/${wordList.length} words (Attempt ${attemptCount})`);
                
                if (score === wordList.length) {
                    break;
                }
            }
            
            if (attemptCount % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        this.words = bestAttempt.words;
        this.grid = bestAttempt.grid;
        
        this.addBlackSquares();
        this.renderGrid();
        this.renderClues();
    }
    
    async placeWordsWithTimeLimit(sortedWords, wordNumber, timeLimit) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeLimit) {
            let placedThisRound = false;
            
            for (let i = 1; i < sortedWords.length; i++) {
                const currentWord = sortedWords[i];
                
                if (this.words.find(w => w.word === currentWord.word)) {
                    continue;
                }
                
                let placed = false;
                
                for (const placedWord of this.words) {
                    if (placed) break;
                    
                    const intersections = this.findIntersections(currentWord.word, placedWord.word);
                    
                    for (const intersection of intersections) {
                        if (placed) break;
                        
                        const newDirection = placedWord.direction === 'across' ? 'down' : 'across';
                        let newRow, newCol;
                        
                        if (placedWord.direction === 'across') {
                            newRow = placedWord.row - intersection.word1Index;
                            newCol = placedWord.col + intersection.word2Index;
                        } else {
                            newRow = placedWord.row + intersection.word2Index;
                            newCol = placedWord.col - intersection.word1Index;
                        }
                        
                        if (newRow >= 0 && newCol >= 0 && newRow < this.gridSize && newCol < this.gridSize &&
                            this.canPlaceWordBasic(currentWord.word, newRow, newCol, newDirection) &&
                            this.wouldCreateValidCrossword(currentWord.word, newRow, newCol, newDirection)) {
                            this.placeWord(currentWord, newRow, newCol, newDirection, wordNumber++);
                            placed = true;
                            placedThisRound = true;
                        }
                    }
                }
            }
            
            if (!placedThisRound) {
                break;
            }
        }
        
        this.tryPlaceRemainingWordsAnywhere(sortedWords, wordNumber)
    }
    

    tryPlaceRemainingWordsAnywhere(sortedWords, wordNumber) {
        const remainingWords = sortedWords.filter(word => 
            !this.words.find(placedWord => placedWord.word === word.word)
        );
        
        for (const word of remainingWords) {
            let placed = false;
            
            for (let row = 1; row < this.gridSize - 1 && !placed; row++) {
                for (let col = 1; col < this.gridSize - 1 && !placed; col++) {
                    for (const direction of ['across', 'down']) {
                        if (placed) break;
                        
                        if (direction === 'across' && col + word.word.length >= this.gridSize) continue;
                        if (direction === 'down' && row + word.word.length >= this.gridSize) continue;
                        
                        if (this.canPlaceWordBasic(word.word, row, col, direction)) {
                            let hasIntersection = false;
                            
                            for (let i = 0; i < word.word.length; i++) {
                                const checkRow = direction === 'across' ? row : row + i;
                                const checkCol = direction === 'across' ? col + i : col;
                                
                                if (this.grid[checkRow][checkCol].letter === word.word[i]) {
                                    hasIntersection = true;
                                    break;
                                }
                            }
                            
                            if (hasIntersection && this.wouldCreateValidCrossword(word.word, row, col, direction)) {
                                this.placeWord(word, row, col, direction, wordNumber++);
                                placed = true;
                            }
                        }
                    }
                }
            }
        }
    }

    wouldCreateValidCrossword(word, row, col, direction) {
        const tempGrid = JSON.parse(JSON.stringify(this.grid));
        
        const wordData = {
            word: word,
            row: row,
            col: col,
            direction: direction
        };
        
        for (let i = 0; i < word.length; i++) {
            const currentRow = direction === 'across' ? row : row + i;
            const currentCol = direction === 'across' ? col + i : col;
            
            tempGrid[currentRow][currentCol].letter = word[i];
            tempGrid[currentRow][currentCol].isBlack = false;
            
            if (direction === 'across') {
                tempGrid[currentRow][currentCol].acrossWord = wordData;
            } else {
                tempGrid[currentRow][currentCol].downWord = wordData;
            }
        }
        
        for (let checkRow = 0; checkRow < this.gridSize; checkRow++) {
            for (let checkCol = 0; checkCol < this.gridSize; checkCol++) {
                const cell = tempGrid[checkRow][checkCol];
                if (cell.letter !== '' && !cell.isBlack) {
                    
                    if ((checkCol > 0 && !tempGrid[checkRow][checkCol - 1].isBlack) ||
                        (checkCol < this.gridSize - 1 && !tempGrid[checkRow][checkCol + 1].isBlack)) {
                        if (!cell.acrossWord) {
                            return false;
                        }
                    }
                    
                    if ((checkRow > 0 && !tempGrid[checkRow - 1][checkCol].isBlack) ||
                        (checkRow < this.gridSize - 1 && !tempGrid[checkRow + 1][checkCol].isBlack)) {
                        if (!cell.downWord) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }

    addBlackSquares() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
                if (cell.letter === '') {
                    cell.isBlack = true;
                }
            }
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';
        
        const table = document.createElement('div');
        table.style.display = 'grid';
        table.style.gridTemplateColumns = `repeat(${this.gridSize}, 25px)`;
        table.style.gap = '1px';
        table.style.backgroundColor = '#ccc';
        table.style.padding = '1px';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
                const cellDiv = document.createElement('div');
                cellDiv.className = 'crossword-cell';
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;
                
                if (cell.isBlack) {
                    cellDiv.classList.add('black');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.value = cell.userInput;
                    input.addEventListener('input', (e) => this.handleCellInput(e, row, col));
                    input.addEventListener('focus', (e) => this.handleCellFocus(e, row, col));
                    input.addEventListener('keydown', (e) => this.handleKeyDown(e, row, col));
                    cellDiv.appendChild(input);
                    
                    if (cell.numbers && cell.numbers.length > 0) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = cell.numbers.sort((a, b) => a - b).join(',');
                        cellDiv.appendChild(numberSpan);
                    }
                }
                
                table.appendChild(cellDiv);
            }
        }
        
        gridContainer.appendChild(table);
    }

    renderClues() {
        const acrossClues = document.getElementById('acrossClues');
        const downClues = document.getElementById('downClues');
        
        acrossClues.innerHTML = '';
        downClues.innerHTML = '';
        
        const acrossWords = this.words.filter(w => w.direction === 'across').sort((a, b) => a.number - b.number);
        const downWords = this.words.filter(w => w.direction === 'down').sort((a, b) => a.number - b.number);
        
        acrossWords.forEach(word => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500';
            clueDiv.innerHTML = `<span class="font-bold">${word.number}.</span> ${word.clue}`;
            clueDiv.addEventListener('click', () => this.highlightWord(word));
            acrossClues.appendChild(clueDiv);
        });
        
        downWords.forEach(word => {
            const clueDiv = document.createElement('div');
            clueDiv.className = 'text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500';
            clueDiv.innerHTML = `<span class="font-bold">${word.number}.</span> ${word.clue}`;
            clueDiv.addEventListener('click', () => this.highlightWord(word));
            downClues.appendChild(clueDiv);
        });
    }

    handleCellInput(event, row, col) {
        const value = event.target.value.toUpperCase();
        this.grid[row][col].userInput = value;
        
        if (value && this.currentWord) {
            this.moveToNextCell(row, col);
        }
    }

    handleCellFocus(event, row, col) {
        const cell = this.grid[row][col];
        
        if (cell.acrossWord && cell.downWord) {
            this.currentDirection = this.currentDirection === 'across' ? 'across' : 'down';
        } else if (cell.acrossWord) {
            this.currentDirection = 'across';
        } else if (cell.downWord) {
            this.currentDirection = 'down';
        }
        
        this.currentWord = this.currentDirection === 'across' ? cell.acrossWord : cell.downWord;
        this.highlightCurrentWord();
    }

    handleKeyDown(event, row, col) {
        if (event.key === 'ArrowRight') {
            this.moveFocus(row, col + 1);
            event.preventDefault();
        } else if (event.key === 'ArrowLeft') {
            this.moveFocus(row, col - 1);
            event.preventDefault();
        } else if (event.key === 'ArrowDown') {
            this.moveFocus(row + 1, col);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            this.moveFocus(row - 1, col);
            event.preventDefault();
        } else if (event.key === 'Backspace' && !event.target.value) {
            this.moveToPreviousCell(row, col);
            event.preventDefault();
        }
    }

    moveFocus(newRow, newCol) {
        if (newRow >= 0 && newRow < this.gridSize && newCol >= 0 && newCol < this.gridSize) {
            const cell = this.grid[newRow][newCol];
            if (!cell.isBlack) {
                const input = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"] input`);
                if (input) input.focus();
            }
        }
    }

    moveToNextCell(row, col) {
        if (!this.currentWord) return;
        
        const direction = this.currentWord.direction;
        const nextRow = direction === 'down' ? row + 1 : row;
        const nextCol = direction === 'across' ? col + 1 : col;
        
        this.moveFocus(nextRow, nextCol);
    }

    moveToPreviousCell(row, col) {
        if (!this.currentWord) return;
        
        const direction = this.currentWord.direction;
        const prevRow = direction === 'down' ? row - 1 : row;
        const prevCol = direction === 'across' ? col - 1 : col;
        
        this.moveFocus(prevRow, prevCol);
    }

    highlightWord(word) {
        this.currentWord = word;
        this.highlightCurrentWord();
        
        const firstInput = document.querySelector(`[data-row="${word.row}"][data-col="${word.col}"] input`);
        if (firstInput) firstInput.focus();
    }

    highlightCurrentWord() {
        document.querySelectorAll('.crossword-cell').forEach(cell => {
            cell.classList.remove('active', 'highlighted');
        });
        
        if (this.currentWord) {
            for (let i = 0; i < this.currentWord.word.length; i++) {
                const row = this.currentWord.direction === 'down' ? this.currentWord.row + i : this.currentWord.row;
                const col = this.currentWord.direction === 'across' ? this.currentWord.col + i : this.currentWord.col;
                
                const cellDiv = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cellDiv) {
                    cellDiv.classList.add('highlighted');
                }
            }
        }
    }

    validateAnswers() {
        let correctCount = 0;
        let totalWords = this.words.length;
        
        this.words.forEach(word => {
            let isCorrect = true;
            for (let i = 0; i < word.word.length; i++) {
                const row = word.direction === 'down' ? word.row + i : word.row;
                const col = word.direction === 'across' ? word.col + i : word.col;
                const userInput = this.grid[row][col].userInput;
                
                if (userInput !== word.word[i]) {
                    isCorrect = false;
                    break;
                }
            }
            if (isCorrect) correctCount++;
        });
        
        alert(`${correctCount} out of ${totalWords} words correct!`);
    }

    toggleClues() {
        this.showClues = !this.showClues;
        const cluesPanel = document.getElementById('cluesPanel');
        cluesPanel.style.display = this.showClues ? 'block' : 'none';
        
        const button = document.getElementById('toggleCluesBtn');
        button.textContent = this.showClues ? 'Hide Clues' : 'Show Clues';
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark', this.isDarkMode);
        
        const button = document.getElementById('darkModeBtn');
        button.textContent = this.isDarkMode ? 'Light Mode' : 'Dark Mode';
    }

    displayValidationResults(results) {
        const container = document.getElementById('validationResults');
        container.innerHTML = '';
        
        if (results[0] === "Word list is valid") {
            container.className = 'mt-4 p-3 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            container.textContent = 'Word list is valid';
        } else {
            container.className = 'mt-4 p-3 rounded text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            container.innerHTML = '<strong>Validation Errors:</strong><br>' + results.join('<br>');
        }
    }

    initializeEventListeners() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generatePuzzle());
        document.getElementById('validateBtn').addEventListener('click', () => this.validateAnswers());
        document.getElementById('toggleCluesBtn').addEventListener('click', () => this.toggleClues());
        document.getElementById('darkModeBtn').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('wordListSelector').addEventListener('change', () => this.generatePuzzle());
        
        this.generatePuzzle();
    }
}

const game = new CrosswordGame();